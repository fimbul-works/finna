import { describe, expect, it } from "vitest";
import { compile as compileFieldQuery } from "../../compile.js";
import { createFinnaContext } from "../../context.js";
import { createEqPredicate as fieldComparisonFactory } from "../equality/eq.js";
import { registerOperator as installFieldOperator } from "../operator-registry.js";
import { createNullishPredicate, createNullishPredicate as fieldSubjectFactory } from "./nullish.js";

describe("createNullishPredicate", () => {
  it("checks nullish values", () => {
    const predicate = createNullishPredicate(true, createFinnaContext());
    for (const value of [false, 0, 0n, "", null, undefined, NaN, true, [], {}]) {
      expect(predicate(value)).toBe(value === null || value === undefined);
    }
  });
  it("evaluates $field references against the root document", () => {
    const cleanups = [
      installFieldOperator("$nullish", fieldSubjectFactory),
      installFieldOperator("$eq", fieldComparisonFactory),
    ];
    try {
      const predicate = compileFieldQuery({ "nested.value": { $nullish: true, $eq: { $field: "expected.value" } } });
      expect(predicate({ nested: { value: null }, expected: { value: null } })).toBe(true);
      expect(predicate({ nested: { value: null }, expected: { value: "different" } })).toBe(false);
    } finally {
      for (const undo of cleanups.reverse()) undo();
    }
  });
});
