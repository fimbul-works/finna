import { describe, expect, it } from "vitest";
import { compile as compileFieldQuery } from "../../compile.js";
import { createFinnaContext } from "../../context.js";
import { createGtePredicate as fieldComparisonFactory } from "../comparison/gte.js";
import { registerOperator as installFieldOperator } from "../operator-registry.js";
import { createAllPredicate, createAllPredicate as fieldSubjectFactory } from "./all.js";

describe("createAllPredicate", () => {
  it("matches literal array membership", () => {
    const predicate = createAllPredicate(["ts", "js"], createFinnaContext());
    expect(predicate(["ts", "js", "vitest"])).toBe(true);
    expect(predicate(["ts"])).toBe(false);
  });

  it("evaluates item predicates with the root value", () => {
    const predicate = createAllPredicate(
      (value: number, root: { minimum: number }) => value >= root.minimum,
      createFinnaContext(),
    );
    expect(predicate([10, 20], { minimum: 10 })).toBe(true);
    expect(predicate([1, 20], { minimum: 10 })).toBe(false);
  });

  it("handles empty arrays", () => {
    expect(createAllPredicate([1], createFinnaContext())([])).toBe(false);
    expect(createAllPredicate([], createFinnaContext())([1])).toBe(true);
    expect(createAllPredicate((value: number) => value > 0, createFinnaContext())([])).toBe(true);
  });

  it.each([null, undefined, "array", 3, {}])("rejects non-array input %j", (actual) => {
    expect(createAllPredicate([1], createFinnaContext())(actual)).toBe(false);
  });
  it("evaluates $field references against the root document", () => {
    const cleanups = [
      installFieldOperator("$all", fieldSubjectFactory),
      installFieldOperator("$gte", fieldComparisonFactory),
    ];
    try {
      const predicate = compileFieldQuery({ "nested.values": { $all: { $gte: { $field: "limits.minimum" } } } });
      expect(predicate({ nested: { values: [10, 20] }, limits: { minimum: 10 } })).toBe(true);
      expect(predicate({ nested: { values: [10, 20] }, limits: { minimum: 21 } })).toBe(false);
    } finally {
      for (const undo of cleanups.reverse()) undo();
    }
  });

  it("matches object subqueries using the document root for $field", () => {
    const cleanups = [
      installFieldOperator("$all", fieldSubjectFactory),
      installFieldOperator("$gte", fieldComparisonFactory),
    ];
    try {
      const predicate = compileFieldQuery({ users: { $all: { age: { $gte: { $field: "limits.age" } } } } });
      const users = [{ age: 25 }, { age: 30 }];
      expect(predicate({ users, limits: { age: 25 } })).toBe(true);
      expect(predicate({ users, limits: { age: 30 } })).toBe(false);
    } finally {
      for (const undo of cleanups.reverse()) undo();
    }
  });

  it("matches object subqueries without field references", () => {
    const cleanups = [
      installFieldOperator("$all", fieldSubjectFactory),
      installFieldOperator("$gte", fieldComparisonFactory),
    ];
    try {
      const users = [{ age: 25 }, { age: 30 }, { age: 40 }];
      expect(compileFieldQuery({ users: { $all: { age: { $gte: 20 } } } })({ users })).toBe(true);
      expect(compileFieldQuery({ users: { $all: { age: { $gte: 30 } } } })({ users })).toBe(false);
    } finally {
      for (const undo of cleanups.reverse()) undo();
    }
  });
});
