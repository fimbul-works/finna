import { compile as compileFieldQuery } from "../../compile.js";
import { registerOperator as installFieldOperator } from "../operator-registry.js";
import { createExistsPredicate as fieldSubjectFactory } from "./exists.js";
import { createEqPredicate as fieldComparisonFactory } from "../equality/eq.js";
import { describe, expect, it } from "vitest";
import { createFinnaContext } from "../../context.js";
import { createExistsPredicate } from "./exists.js";

describe("createExistsPredicate", () => {
  it.each(["value", null, 0, false, [], {}])("recognizes defined values %j", (actual) => {
    expect(createExistsPredicate(true, createFinnaContext())(actual)).toBe(true);
    expect(createExistsPredicate(false, createFinnaContext())(actual)).toBe(false);
  });
  it("recognizes undefined as absent", () => {
    expect(createExistsPredicate(true, createFinnaContext())(undefined)).toBe(false);
    expect(createExistsPredicate(false, createFinnaContext())(undefined)).toBe(true);
  });
  it("evaluates $field references against the root document", () => {
    const cleanups = [
      installFieldOperator("$exists", fieldSubjectFactory),
      installFieldOperator("$eq", fieldComparisonFactory),
    ];
    try {
      const predicate = compileFieldQuery({ "nested.value": { $exists: true, $eq: { $field: "expected.value" } } });
      expect(predicate({ nested: { value: "hello" }, expected: { value: "hello" } })).toBe(true);
      expect(predicate({ nested: { value: "hello" }, expected: { value: "different" } })).toBe(false);
    } finally {
      for (const undo of cleanups.reverse()) undo();
    }
  });
});
