import { compile as compileFieldQuery } from "../../compile.js";
import { registerOperator as installFieldOperator } from "../operator-registry.js";
import { createSizePredicate as fieldSubjectFactory } from "./size.js";
import { createGtePredicate as fieldComparisonFactory } from "../comparison/gte.js";
import { describe, expect, it } from "vitest";
import { createFinnaContext } from "../../context.js";
import { createSizePredicate } from "./size.js";

describe("createSizePredicate", () => {
  it("matches the exact array length", () => {
    const predicate = createSizePredicate(3, createFinnaContext());
    expect(predicate(["ts", "js", "vitest"])).toBe(true);
    expect(predicate(["ts", "js"])).toBe(false);
    expect(createSizePredicate(0, createFinnaContext())([])).toBe(true);
  });

  it("passes the array length and root to a predicate", () => {
    const predicate = createSizePredicate(
      (length: number, root: { count: number }) => length === root.count,
      createFinnaContext(),
    );
    expect(predicate([1, 2], { count: 2 })).toBe(true);
    expect(predicate([1, 2], { count: 3 })).toBe(false);
  });

  it.each([null, undefined, "array", 3, { length: 3 }])("rejects non-array input %j", (actual) => {
    expect(createSizePredicate(3, createFinnaContext())(actual)).toBe(false);
  });
  it("evaluates $field references against the root document", () => {
    const cleanups = [
      installFieldOperator("$size", fieldSubjectFactory),
      installFieldOperator("$gte", fieldComparisonFactory),
    ];
    try {
      const predicate = compileFieldQuery({ "nested.values": { $size: { $gte: { $field: "limits.minimum" } } } });
      expect(predicate({ nested: { values: [10, 20] }, limits: { minimum: 2 } })).toBe(true);
      expect(predicate({ nested: { values: [10, 20] }, limits: { minimum: 3 } })).toBe(false);
    } finally {
      for (const undo of cleanups.reverse()) undo();
    }
  });
});
