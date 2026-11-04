import { compile as compileFieldQuery } from "../../compile.js";
import { registerOperator as installFieldOperator } from "../operator-registry.js";
import { createFalsyPredicate as fieldSubjectFactory } from "./falsy.js";
import { createEqPredicate as fieldComparisonFactory } from "../equality/eq.js";
import { describe, expect, it } from "vitest";
import { createFinnaContext } from "../../context.js";
import { createFalsyPredicate } from "./falsy.js";

describe("createFalsyPredicate", () => {
  it("checks falsy values", () => {
    const predicate = createFalsyPredicate(true, createFinnaContext());
    for (const value of [false, 0, 0n, "", null, undefined, NaN, true, [], {}]) {
      expect(predicate(value)).toBe(!value);
    }
  });
  it("evaluates $field references against the root document", () => {
    const cleanups = [
      installFieldOperator("$falsy", fieldSubjectFactory),
      installFieldOperator("$eq", fieldComparisonFactory),
    ];
    try {
      const predicate = compileFieldQuery({ "nested.value": { $falsy: true, $eq: { $field: "expected.value" } } });
      expect(predicate({ nested: { value: false }, expected: { value: false } })).toBe(true);
      expect(predicate({ nested: { value: false }, expected: { value: "different" } })).toBe(false);
    } finally {
      for (const undo of cleanups.reverse()) undo();
    }
  });
});
