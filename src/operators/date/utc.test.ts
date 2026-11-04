import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { compile as compileFieldQuery } from "../../compile.js";
import { createFinnaContext } from "../../context.js";
import { createGtePredicate as fieldComparisonFactory } from "../comparison/gte.js";
import { clearOperators, registerOperator as installFieldOperator } from "../operator-registry.js";
import { createHourPredicate as fieldHourFactory } from "./hour.js";
import { registerDateOperators } from "./index.js";
import { createUtcPredicate, createUtcPredicate as fieldSubjectFactory } from "./utc.js";

describe("createUtcPredicate", () => {
  beforeEach(() => {
    clearOperators();
    registerDateOperators();
  });
  afterEach(clearOperators);

  it("enables UTC for nested filters without changing the parent context", () => {
    const ctx = createFinnaContext(false);
    const predicate = createUtcPredicate({ $year: 2023, $hour: 12 }, ctx);
    expect(predicate(new Date("2023-10-23T12:00:00Z"))).toBe(true);
    expect(predicate(new Date("2023-10-23T13:00:00Z"))).toBe(false);
    expect(ctx.useUTC).toBe(false);
  });
  it("preserves root values through nested UTC modifiers", () => {
    const predicate = createUtcPredicate(
      { $utc: { $hour: (hour: number, root: { hour: number }) => hour === root.hour } },
      createFinnaContext(),
    );
    expect(predicate(new Date("2023-10-23T12:00:00Z"), { hour: 12 })).toBe(true);
    expect(predicate(new Date("2023-10-23T12:00:00Z"), { hour: 13 })).toBe(false);
  });
  it("shares diagnostics with the parent context", () => {
    const ctx = createFinnaContext();
    expect(() => createUtcPredicate({ $unknown: true }, ctx)).toThrow(AggregateError);
    expect(ctx.errors).toHaveLength(1);
  });
  it("evaluates $field references against the root document", () => {
    const cleanups = [
      installFieldOperator("$utc", fieldSubjectFactory),
      installFieldOperator("$gte", fieldComparisonFactory),
      installFieldOperator("$hour", fieldHourFactory),
    ];
    try {
      const predicate = compileFieldQuery(
        { "nested.created": { $utc: { $hour: { $gte: { $field: "limits.minimum" } } } } },
        createFinnaContext(true),
      );
      expect(predicate({ nested: { created: new Date("2023-10-23T12:30:45.500Z") }, limits: { minimum: 12 } })).toBe(
        true,
      );
      expect(predicate({ nested: { created: new Date("2023-10-23T12:30:45.500Z") }, limits: { minimum: 13 } })).toBe(
        false,
      );
    } finally {
      for (const undo of cleanups.reverse()) undo();
    }
  });
  it("is idempotent for an explicitly configured UTC context", () => {
    const ctx = createFinnaContext({ useUTC: true, throwErrors: false, warningsAsErrors: true });
    const predicate = createUtcPredicate({ $utc: { $hour: 12 } }, ctx);
    expect(predicate(new Date("2023-10-23T12:00:00Z"))).toBe(true);
    expect(predicate(new Date("2023-10-23T13:00:00Z"))).toBe(false);
    expect(ctx).toEqual(createFinnaContext({ useUTC: true, throwErrors: false, warningsAsErrors: true }));
  });
});
