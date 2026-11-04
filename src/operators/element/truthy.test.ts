import { describe, expect, it } from "vitest";
import { compile as compileFieldQuery } from "../../compile.js";
import { createFinnaContext } from "../../context.js";
import { createEqPredicate as fieldComparisonFactory } from "../equality/eq.js";
import { registerOperator as installFieldOperator } from "../operator-registry.js";
import { createTruthyPredicate, createTruthyPredicate as fieldSubjectFactory } from "./truthy.js";

describe("createTruthyPredicate", () => {
  it("checks truthy values", () => {
    const predicate = createTruthyPredicate(true, createFinnaContext());
    for (const value of [false, 0, 0n, "", null, undefined, NaN, true, [], {}]) {
      expect(predicate(value)).toBe(Boolean(value));
    }
  });
  it("evaluates $field references against the root document", () => {
    const cleanups = [
      installFieldOperator("$truthy", fieldSubjectFactory),
      installFieldOperator("$eq", fieldComparisonFactory),
    ];
    try {
      const predicate = compileFieldQuery({ "nested.value": { $truthy: true, $eq: { $field: "expected.value" } } });
      expect(predicate({ nested: { value: "hello" }, expected: { value: "hello" } })).toBe(true);
      expect(predicate({ nested: { value: "hello" }, expected: { value: "different" } })).toBe(false);
    } finally {
      for (const undo of cleanups.reverse()) undo();
    }
  });
});
