import { describe, expect, it } from "vitest";
import { compile as compileFieldQuery } from "../../compile.js";
import { createFinnaContext } from "../../context.js";
import { createGtePredicate as fieldComparisonFactory } from "../comparison/gte.js";
import { registerOperator as installFieldOperator } from "../operator-registry.js";
import { createSomePredicate, createSomePredicate as fieldSubjectFactory } from "./some.js";

describe("createSomePredicate", () => {
  it("matches literal array membership", () => {
    const predicate = createSomePredicate(["js", "rust"], createFinnaContext());
    expect(predicate(["ts", "js"])).toBe(true);
    expect(predicate(["python"])).toBe(false);
  });

  it("evaluates item predicates with the root value", () => {
    const predicate = createSomePredicate(
      (value: number, root: { minimum: number }) => value >= root.minimum,
      createFinnaContext(),
    );
    expect(predicate([1, 20], { minimum: 10 })).toBe(true);
    expect(predicate([1, 2], { minimum: 10 })).toBe(false);
  });

  it("handles empty arrays", () => {
    expect(createSomePredicate([1], createFinnaContext())([])).toBe(false);
    expect(createSomePredicate([], createFinnaContext())([1])).toBe(false);
    expect(createSomePredicate((value: number) => value > 0, createFinnaContext())([])).toBe(false);
  });

  it.each([null, undefined, "array", 3, {}])("rejects non-array input %j", (actual) => {
    expect(createSomePredicate([1], createFinnaContext())(actual)).toBe(false);
  });
  it("evaluates $field references against the root document", () => {
    const cleanups = [
      installFieldOperator("$some", fieldSubjectFactory),
      installFieldOperator("$gte", fieldComparisonFactory),
    ];
    try {
      const predicate = compileFieldQuery({ "nested.values": { $some: { $gte: { $field: "limits.minimum" } } } });
      expect(predicate({ nested: { values: [10, 20] }, limits: { minimum: 10 } })).toBe(true);
      expect(predicate({ nested: { values: [10, 20] }, limits: { minimum: 21 } })).toBe(false);
    } finally {
      for (const undo of cleanups.reverse()) undo();
    }
  });

  it("matches object subqueries using the document root for $field", () => {
    const cleanups = [
      installFieldOperator("$some", fieldSubjectFactory),
      installFieldOperator("$gte", fieldComparisonFactory),
    ];
    try {
      const predicate = compileFieldQuery({ users: { $some: { age: { $gte: { $field: "limits.age" } } } } });
      const users = [{ age: 25 }, { age: 30 }];
      expect(predicate({ users, limits: { age: 25 } })).toBe(true);
      expect(predicate({ users, limits: { age: 31 } })).toBe(false);
    } finally {
      for (const undo of cleanups.reverse()) undo();
    }
  });

  it("matches object subqueries without field references", () => {
    const cleanups = [
      installFieldOperator("$some", fieldSubjectFactory),
      installFieldOperator("$gte", fieldComparisonFactory),
    ];
    try {
      const users = [{ age: 25 }, { age: 30 }, { age: 40 }];
      expect(compileFieldQuery({ users: { $some: { age: { $gte: 35 } } } })({ users })).toBe(true);
      expect(compileFieldQuery({ users: { $some: { age: { $gte: 41 } } } })({ users })).toBe(false);
    } finally {
      for (const undo of cleanups.reverse()) undo();
    }
  });
});
