import { beforeEach, describe, expect, it, vi } from "vitest";
import { childContext, QueryDiagnostic, reportError, reportWarning } from "./context.js";
import {
  clearOperators,
  compile,
  createFinnaContext,
  createPredicate,
  type FilterPredicate,
  type QueryCompilationError,
  registerAllOperators,
  registerOperator,
} from "./index.js";

function errorsFrom(build: () => unknown): QueryCompilationError[] {
  try {
    build();
  } catch (error) {
    expect(error).toBeInstanceOf(AggregateError);
    return (error as AggregateError).errors;
  }
  throw new Error("Expected compilation to fail");
}

describe("compilation diagnostics", () => {
  beforeEach(() => {
    clearOperators();
    registerAllOperators();
  });

  it("collects errors in nested objects, array filters, logical branches, and UTC contexts", () => {
    const errors = errorsFrom(() =>
      compile({
        profile: { age: { $in: 1 } },
        tags: { $some: { $unknown: true } },
        $or: [{ score: { $nin: 1 } }, { score: { $missing: true } }],
        date: { $utc: { $year: { $bad: true } } },
      }),
    );
    expect(errors.map((error) => error.path)).toEqual([
      ["profile", "age", "$in"],
      ["tags", "$some", "$unknown"],
      ["$or", 0, "score", "$nin"],
      ["$or", 1, "score", "$missing"],
      ["date", "$utc", "$year", "$bad"],
    ]);
    expect(errors.every((error) => error instanceof Error && error.cause instanceof Error)).toBe(true);
  });

  it("reports malformed logical queries alongside sibling errors", () => {
    const errors = errorsFrom(() => compile({ $and: 12, $not: null, x: { $regex: "[" } } as any));
    expect(errors.map((error) => error.path)).toEqual([["$and"], ["$not"], ["x", "$regex"]]);
  });

  it("uses the same aggregation boundary for createPredicate", () => {
    expect(errorsFrom(() => createPredicate({ a: { $in: 1 }, b: { $nin: 2 } }))).toHaveLength(2);
  });

  it("does not carry earlier failures into later compilations with a shared context", () => {
    const ctx = createFinnaContext();
    expect(errorsFrom(() => compile({ x: { $in: 1 } }, ctx))).toHaveLength(1);
    expect(ctx.errors).toHaveLength(1);
    expect(compile({ x: { $gt: 1 } }, ctx)({ x: 2 })).toBe(true);
    expect(errorsFrom(() => compile({ x: { $nin: 1 } }, ctx))).toHaveLength(1);
    expect(ctx.errors).toHaveLength(2);
  });

  it("never compiles array item predicates during evaluation", () => {
    let builds = 0;
    registerOperator("$countBuilds", () => {
      builds++;
      return (() => true) as unknown as FilterPredicate;
    });
    const predicate = compile({ tags: { $some: { nested: { $countBuilds: true } } } });
    expect(builds).toBe(1);
    predicate({ tags: [{ nested: 1 }, { nested: 2 }] });
    predicate({ tags: [{ nested: 3 }] });
    expect(builds).toBe(1);
  });

  it("treats runtime type mismatches as false without recording errors", () => {
    const ctx = createFinnaContext();
    const array = compile({ value: { $size: 2 } }, ctx);
    const date = compile({ value: { $year: 2024 } }, ctx);
    for (const value of [null, undefined, "wrong", {}, new Date(NaN), NaN]) {
      expect(array({ value })).toBe(false);
      expect(date({ value })).toBe(false);
    }
    expect(ctx.errors).toEqual([]);
  });
  it("resolves missing $field paths without adding compilation diagnostics", () => {
    const ctx = createFinnaContext();
    const predicate = compile({ value: { $gt: { $field: "limits.minimum" } } }, ctx);
    expect(predicate({ value: 10, limits: { minimum: 9 } })).toBe(true);
    expect(predicate({ value: 10 })).toBe(false);
    expect(ctx.errors).toEqual([]);
  });
  it("defaults to local time, strict errors, nonfatal warnings, and silent logging", () => {
    expect(createFinnaContext()).toEqual({
      useUTC: false,
      throwErrors: true,
      warningsAsErrors: false,
      captureStacks: false,
      logger: undefined,
      errors: [],
      warnings: [],
    });
    expect(createFinnaContext(true).useUTC).toBe(true);
    expect(createFinnaContext({ useUTC: true }).useUTC).toBe(true);
    expect(createFinnaContext().errors).not.toBe(createFinnaContext().errors);
  });

  it("records located diagnostics with optional full stacks and original causes", () => {
    const cause = new Error("original");
    const ctx = createFinnaContext();
    reportError(childContext(ctx, "$custom"), cause);
    expect(ctx.errors[0]).toMatchObject({ phase: "compile", severity: "error", operator: "$custom", cause });
    expect(ctx.errors[0].stack).toBeUndefined();
    const debug = createFinnaContext({ captureStacks: true });
    reportWarning(childContext(debug, "field"), "advice");
    expect(debug.warnings[0]).toBeInstanceOf(QueryDiagnostic);
    expect(debug.warnings[0].stack).toContain("QueryDiagnostic");
    expect(debug.warnings[0]).toMatchObject({ phase: "compile", severity: "warning", path: ["field"] });
  });

  it("isolates logger failures and logs direct compilation pushes once", () => {
    const error = vi.fn(() => {
      throw new Error("logger unavailable");
    });
    const ctx = createFinnaContext({ logger: { error, warn: vi.fn() } });
    registerOperator("$directError", (_, nested) => {
      nested.errors.push(new Error("invalid argument"));
      return (() => true) as unknown as FilterPredicate;
    });
    expect(() => compile({ value: { $directError: true } }, ctx)).toThrow(AggregateError);
    expect(ctx.errors).toHaveLength(1);
    expect(ctx.errors[0]).toMatchObject({ phase: "compile", path: ["value", "$directError"] });
    expect(error).toHaveBeenCalledTimes(1);
  });

  it("preserves diagnostic configuration through repeated UTC modifiers without changing the parent", () => {
    const ctx = createFinnaContext({ warningsAsErrors: true, captureStacks: true });
    const seen: boolean[] = [];
    registerOperator("$observeUTC", (_, nested) => {
      expect(nested.warningsAsErrors).toBe(true);
      expect(nested.captureStacks).toBe(true);
      return (() => {
        seen.push(nested.useUTC);
        return true;
      }) as unknown as FilterPredicate;
    });
    const predicate = compile(
      {
        local: { $observeUTC: true },
        utc: { $utc: { $utc: { $observeUTC: true } } },
      },
      ctx,
    );
    expect(predicate({ local: new Date(), utc: new Date() })).toBe(true);
    expect(seen).toEqual([false, true]);
    expect(ctx.useUTC).toBe(false);
    expect(ctx.errors).toEqual([]);
    expect(ctx.warnings).toEqual([]);
  });
});
