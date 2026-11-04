import { compile as compileFieldQuery } from "../../compile.js";
import { registerOperator as installFieldOperator } from "../operator-registry.js";
import { createNonePredicate as fieldSubjectFactory } from "./none.js";
import { createGtePredicate as fieldComparisonFactory } from "../comparison/gte.js";
import { describe, expect, it } from "vitest";
import { createFinnaContext } from "../../context.js";
import { createNonePredicate } from "./none.js";

describe("createNonePredicate", () => {
  it("matches literal array membership", () => {
    const predicate = createNonePredicate(["rust", "python"], createFinnaContext());
    expect(predicate(["ts", "js"])).toBe(true);
    expect(predicate(["js", "rust"])).toBe(false);
  });

  it("evaluates item predicates with the root value", () => {
    const predicate = createNonePredicate(
      (value: number, root: { minimum: number }) => value >= root.minimum,
      createFinnaContext(),
    );
    expect(predicate([1, 2], { minimum: 10 })).toBe(true);
    expect(predicate([1, 20], { minimum: 10 })).toBe(false);
  });

  it("handles empty arrays", () => {
    expect(createNonePredicate([1], createFinnaContext())([])).toBe(true);
    expect(createNonePredicate([], createFinnaContext())([1])).toBe(true);
    expect(createNonePredicate((value: number) => value > 0, createFinnaContext())([])).toBe(true);
  });

  it.each([null, undefined, "array", 3, {}])("rejects non-array input %j", (actual) => {
    expect(createNonePredicate([1], createFinnaContext())(actual)).toBe(false);
  });
  it("evaluates $field references against the root document", () => {
    const cleanups = [
      installFieldOperator("$none", fieldSubjectFactory),
      installFieldOperator("$gte", fieldComparisonFactory),
    ];
    try {
      const predicate = compileFieldQuery({ "nested.values": { $none: { $gte: { $field: "limits.minimum" } } } });
      expect(predicate({ nested: { values: [10, 20] }, limits: { minimum: 21 } })).toBe(true);
      expect(predicate({ nested: { values: [10, 20] }, limits: { minimum: 20 } })).toBe(false);
    } finally {
      for (const undo of cleanups.reverse()) undo();
    }
  });

  it("matches object subqueries using the document root for $field", () => {
    const cleanups = [
      installFieldOperator("$none", fieldSubjectFactory),
      installFieldOperator("$gte", fieldComparisonFactory),
    ];
    try {
      const predicate = compileFieldQuery({ users: { $none: { age: { $gte: { $field: "limits.age" } } } } });
      const users = [{ age: 25 }, { age: 30 }];
      expect(predicate({ users, limits: { age: 31 } })).toBe(true);
      expect(predicate({ users, limits: { age: 30 } })).toBe(false);
    } finally {
      for (const undo of cleanups.reverse()) undo();
    }
  });

  it("matches object subqueries without field references", () => {
    const cleanups = [
      installFieldOperator("$none", fieldSubjectFactory),
      installFieldOperator("$gte", fieldComparisonFactory),
    ];
    try {
      const users = [{ age: 25 }, { age: 30 }, { age: 40 }];
      expect(compileFieldQuery({ users: { $none: { age: { $gte: 41 } } } })({ users })).toBe(true);
      expect(compileFieldQuery({ users: { $none: { age: { $gte: 35 } } } })({ users })).toBe(false);
    } finally {
      for (const undo of cleanups.reverse()) undo();
    }
  });
});
