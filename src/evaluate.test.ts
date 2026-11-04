import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createTestLogger } from "../test-utils/test-logger.js";
import { compile } from "./compile.js";
import { childContext, createFinnaContext, QueryEvaluationError, reportError, reportWarning } from "./context.js";
import { evaluate } from "./evaluate.js";
import { clearOperators, registerOperator } from "./operators/operator-registry.js";
import { registerAllOperators } from "./operators/register-all.js";
import type { FilterPredicate } from "./types.js";

const failure = new Error("predicate failed");
function installFailure() {
  registerOperator(
    "$fails",
    () =>
      (() => {
        throw failure;
      }) as unknown as FilterPredicate,
  );
}

describe("evaluate", () => {
  beforeEach(() => {
    clearOperators();
    registerAllOperators();
  });
  afterEach(clearOperators);

  it("returns matches and non-matches with $field comparisons", () => {
    const ctx = createFinnaContext({ throwErrors: false });
    const query = { value: { $gt: { $field: "limits.minimum" } } };
    expect(evaluate({ value: 5, limits: { minimum: 4 } }, query, ctx)).toEqual({ matched: true, context: ctx });
    expect(evaluate({ value: 5, limits: { minimum: 6 } }, query, ctx).matched).toBe(false);
    expect(ctx.errors).toEqual([]);
  });

  it("throws runtime aggregates by default and distinguishes errors from non-matches", () => {
    installFailure();
    const ctx = createFinnaContext();
    expect(() => evaluate({ value: 5 }, { value: { $fails: true } }, ctx)).toThrow(AggregateError);
    expect(ctx.errors).toHaveLength(1);
    expect(ctx.errors[0]).toBeInstanceOf(QueryEvaluationError);
    expect(ctx.errors[0].cause).toBe(failure);
    const quiet = createFinnaContext({ throwErrors: false });
    expect(evaluate({ value: 5 }, { value: { $fails: true } }, quiet).matched).toBeNull();
    expect(quiet.errors).toHaveLength(1);
    expect(evaluate({ value: 5 }, { value: { $unknown: true } }, quiet).matched).toBeNull();
    expect(evaluate({ value: 5 }, { value: 5 }, quiet).matched).toBe(true);
  });

  it.each(["$not", "$nor", "$or"])("cannot turn failures into matches with %s", (operator) => {
    installFailure();
    const broken = { value: { $fails: true } };
    const query = operator === "$not" ? { $not: broken } : { [operator]: [broken, { value: 5 }] };
    const ctx = createFinnaContext({ throwErrors: false });
    expect(evaluate({ value: 5 }, query, ctx).matched).toBeNull();
    expect(ctx.errors).toHaveLength(1);
  });

  it("collects errors from executed OR branches and logs each diagnostic once", () => {
    installFailure();
    const { error, warn } = createTestLogger();
    const ctx = createFinnaContext({ throwErrors: false, logger: { error, warn } });
    const query = { $or: [{ a: { $fails: true } }, { b: { $fails: true } }] };
    expect(evaluate({ a: 1, b: 2 }, query, ctx).matched).toBeNull();
    expect(ctx.errors).toHaveLength(2);
    expect(error).toHaveBeenCalledTimes(2);
    expect(error.mock.calls.map((call) => call[0].path)).toEqual([
      ["$or", 0, "a", "$fails"],
      ["$or", 1, "b", "$fails"],
    ]);
    expect(error.mock.calls[0][0]).toMatchObject({ phase: "evaluate", severity: "error", operator: "$fails" });
    expect(Object.keys(error.mock.calls[0][0])).not.toContain("value");
    expect(warn).not.toHaveBeenCalled();
  });

  it("respects short-circuiting and leaves skipped branches unevaluated", () => {
    installFailure();
    const ctx = createFinnaContext();
    expect(evaluate({ value: 5 }, { $or: [{ value: 5 }, { value: { $fails: true } }] }, ctx).matched).toBe(true);
    expect(ctx.errors).toEqual([]);
  });

  it("supports execution warnings, escalation, and direct diagnostic array pushes", () => {
    registerOperator(
      "$advised",
      (_, ctx) =>
        ((value: number) => {
          if (value === 1) reportWarning(ctx, "advice");
          if (value === 2) ctx.warnings.push(new Error("direct warning"));
          if (value === 3) ctx.errors.push(new Error("direct error"));
          return true;
        }) as FilterPredicate,
    );
    const logger = createTestLogger();
    const ctx = createFinnaContext({ throwErrors: false, logger });
    const query = { value: { $advised: true } };
    expect(evaluate({ value: 1 }, query, ctx).matched).toBe(true);
    expect(ctx.warnings[0]).toMatchObject({ phase: "evaluate", path: ["value", "$advised"] });
    ctx.warningsAsErrors = true;
    expect(evaluate({ value: 2 }, query, ctx).matched).toBeNull();
    expect(ctx.errors).toEqual([]);
    expect(ctx.warnings).toHaveLength(2);
    expect(evaluate({ value: 3 }, query, ctx).matched).toBeNull();
    expect(ctx.errors).toHaveLength(1);
    expect(logger.warn).toHaveBeenCalledTimes(2);
    expect(logger.error).toHaveBeenCalledTimes(1);
    expect(evaluate({ value: 0 }, query, ctx).matched).toBe(true);
  });

  it("handles explicitly reported errors without requiring the custom operator to throw", () => {
    registerOperator(
      "$reports",
      (_, ctx) =>
        (() => {
          reportError(ctx, failure);
          return true;
        }) as unknown as FilterPredicate,
    );
    const ctx = createFinnaContext({ throwErrors: false });
    expect(evaluate({ value: 1 }, { value: { $reports: true } }, ctx).matched).toBeNull();
    expect(ctx.errors).toHaveLength(1);
  });

  it("aggregates strict compiled predicates using only the current invocation's failures", () => {
    const ctx = createFinnaContext({ throwErrors: false });
    const predicate = compile((value: any) => {
      if (value.bad) throw failure;
      return true;
    }, ctx);
    expect(() => predicate({ bad: true })).toThrow(AggregateError);
    expect(predicate({ bad: false })).toBe(true);
    expect(() => predicate({ bad: true })).toThrow(AggregateError);
    expect(ctx.errors).toHaveLength(2);
  });

  it("isolates recursive executions when an inner failure is handled by the consumer", () => {
    const ctx = createFinnaContext({ throwErrors: false });
    let predicate: FilterPredicate;
    predicate = compile((value: any) => {
      if (value.inner) throw failure;
      try {
        predicate({ inner: true });
      } catch (error) {
        expect(error).toBeInstanceOf(AggregateError);
      }
      return true;
    }, ctx);
    expect(predicate({ inner: false })).toBe(true);
    expect(ctx.errors).toHaveLength(1);
  });

  it("keeps ordinary type mismatches quiet and never logs to the console by default", () => {
    const consoleWarn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    try {
      const ctx = createFinnaContext({ throwErrors: false });
      expect(evaluate({ value: 1 }, { value: { $uppercase: "A" } }, ctx).matched).toBe(false);
      expect(ctx.errors).toEqual([]);
      installFailure();
      evaluate({ value: 1 }, { value: { $fails: true } }, ctx);
      expect(consoleWarn).not.toHaveBeenCalled();
      expect(consoleError).not.toHaveBeenCalled();
    } finally {
      consoleWarn.mockRestore();
      consoleError.mockRestore();
    }
  });
  it("locates document getter failures without logging the document", () => {
    const ctx = createFinnaContext({ throwErrors: false });
    const document = {
      get value(): number {
        throw failure;
      },
    };
    expect(evaluate(document, { value: 1 }, ctx).matched).toBeNull();
    expect(ctx.errors[0]).toMatchObject({ phase: "evaluate", path: ["value"] });
  });

  it("routes runtime warnings from child contexts into the current invocation", () => {
    registerOperator(
      "$advised",
      (_, ctx) =>
        (() => {
          reportWarning(childContext(ctx, "detail"), "advice");
          return true;
        }) as unknown as FilterPredicate,
    );
    const ctx = createFinnaContext({ throwErrors: false, warningsAsErrors: true });
    expect(evaluate({ value: 1 }, { value: { $advised: true } }, ctx).matched).toBeNull();
    expect(ctx.errors).toEqual([]);
    expect(ctx.warnings[0]).toMatchObject({ phase: "evaluate", path: ["value", "$advised", "detail"] });
  });

  it("keeps compilation diagnostics correctly phased when compilation occurs inside a predicate", () => {
    const ctx = createFinnaContext({ throwErrors: false });
    const predicate = compile(() => {
      compile({ value: { $unknown: true } }, ctx);
      return true;
    }, ctx);
    expect(() => predicate({})).toThrow(AggregateError);
    expect(ctx.errors).toHaveLength(1);
    expect(ctx.errors[0]).toMatchObject({ phase: "compile", path: ["value", "$unknown"] });
  });
  it("does not swallow an empty AggregateError thrown by user code", () => {
    const ctx = createFinnaContext({ throwErrors: false });
    expect(
      evaluate(
        {},
        () => {
          throw new AggregateError([], "user failure");
        },
        ctx,
      ).matched,
    ).toBeNull();
    expect(ctx.errors).toHaveLength(1);
    expect(ctx.errors[0].cause).toBeInstanceOf(AggregateError);
  });

  it("preserves a propagated inner warning failure even when outer warnings are nonfatal", () => {
    registerOperator(
      "$warn",
      (_, ctx) =>
        (() => {
          reportWarning(ctx, "inner warning");
          return true;
        }) as unknown as FilterPredicate,
    );
    const innerContext = createFinnaContext({ warningsAsErrors: true });
    const inner = compile({ value: { $warn: true } }, innerContext);
    const outerContext = createFinnaContext({ throwErrors: false });
    expect(evaluate({ value: 1 }, (value: any) => inner(value), outerContext).matched).toBeNull();
    expect(outerContext.errors).toEqual([]);
    expect(outerContext.warnings).toHaveLength(1);
    expect(outerContext.warnings[0]).toBe(innerContext.warnings[0]);
  });
});
