import { describe, expect, it } from "vitest";
import { compile as compileFieldQuery } from "../../compile.js";
import { createFinnaContext } from "../../context.js";
import { createGtePredicate as fieldComparisonFactory } from "../comparison/gte.js";
import { registerOperator as installFieldOperator } from "../operator-registry.js";
import { createWeekdayPredicate, createWeekdayPredicate as fieldSubjectFactory } from "./weekday.js";

describe("createWeekdayPredicate", () => {
  const date = new Date("2023-10-23T12:30:45.500Z");
  it("extracts UTC components from dates and timestamps", () => {
    const predicate = createWeekdayPredicate(1, createFinnaContext(true));
    expect(predicate(date)).toBe(true);
    expect(predicate(date.getTime())).toBe(true);
    expect(createWeekdayPredicate(2, createFinnaContext(true))(date)).toBe(false);
  });
  it("extracts local components when UTC is disabled", () => {
    expect(createWeekdayPredicate(date.getDay(), createFinnaContext(false))(date)).toBe(true);
  });
  it("passes the extracted component and root to a nested predicate", () => {
    const predicate = createWeekdayPredicate(
      (value: number, root: { expected: number }) => value === root.expected,
      createFinnaContext(true),
    );
    expect(predicate(date, { expected: 1 })).toBe(true);
    expect(predicate(date, { expected: 2 })).toBe(false);
  });
  it.each([null, undefined, "2023-10-23", {}, new Date(NaN), NaN, Infinity])(
    "rejects invalid dates and non-date values %j",
    (actual) => {
      expect(createWeekdayPredicate(1, createFinnaContext(true))(actual)).toBe(false);
    },
  );
  it("evaluates $field references against the root document", () => {
    const cleanups = [
      installFieldOperator("$weekday", fieldSubjectFactory),
      installFieldOperator("$gte", fieldComparisonFactory),
    ];
    try {
      const predicate = compileFieldQuery(
        { "nested.created": { $weekday: { $gte: { $field: "limits.minimum" } } } },
        createFinnaContext(true),
      );
      expect(predicate({ nested: { created: new Date("2023-10-23T12:30:45.500Z") }, limits: { minimum: 1 } })).toBe(
        true,
      );
      expect(predicate({ nested: { created: new Date("2023-10-23T12:30:45.500Z") }, limits: { minimum: 2 } })).toBe(
        false,
      );
    } finally {
      for (const undo of cleanups.reverse()) undo();
    }
  });
});
