import { describe, expect, it } from "vitest";
import { compile as compileFieldQuery } from "../../compile.js";
import { createFinnaContext } from "../../context.js";
import { createGtePredicate as fieldComparisonFactory } from "../comparison/gte.js";
import { registerOperator as installFieldOperator } from "../operator-registry.js";
import { createMsPredicate, createMsPredicate as fieldSubjectFactory } from "./ms.js";

describe("createMsPredicate", () => {
  const date = new Date("2023-10-23T12:30:45.500Z");
  it("extracts UTC components from dates and timestamps", () => {
    const predicate = createMsPredicate(500, createFinnaContext(true));
    expect(predicate(date)).toBe(true);
    expect(predicate(date.getTime())).toBe(true);
    expect(createMsPredicate(501, createFinnaContext(true))(date)).toBe(false);
  });
  it("extracts local components when UTC is disabled", () => {
    expect(createMsPredicate(date.getMilliseconds(), createFinnaContext(false))(date)).toBe(true);
  });
  it("passes the extracted component and root to a nested predicate", () => {
    const predicate = createMsPredicate(
      (value: number, root: { expected: number }) => value === root.expected,
      createFinnaContext(true),
    );
    expect(predicate(date, { expected: 500 })).toBe(true);
    expect(predicate(date, { expected: 501 })).toBe(false);
  });
  it.each([null, undefined, "2023-10-23", {}, new Date(NaN), NaN, Infinity])(
    "rejects invalid dates and non-date values %j",
    (actual) => {
      expect(createMsPredicate(500, createFinnaContext(true))(actual)).toBe(false);
    },
  );
  it("evaluates $field references against the root document", () => {
    const cleanups = [
      installFieldOperator("$ms", fieldSubjectFactory),
      installFieldOperator("$gte", fieldComparisonFactory),
    ];
    try {
      const predicate = compileFieldQuery(
        { "nested.created": { $ms: { $gte: { $field: "limits.minimum" } } } },
        createFinnaContext(true),
      );
      expect(predicate({ nested: { created: new Date("2023-10-23T12:30:45.500Z") }, limits: { minimum: 500 } })).toBe(
        true,
      );
      expect(predicate({ nested: { created: new Date("2023-10-23T12:30:45.500Z") }, limits: { minimum: 501 } })).toBe(
        false,
      );
    } finally {
      for (const undo of cleanups.reverse()) undo();
    }
  });
});
