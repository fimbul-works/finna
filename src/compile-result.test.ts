import { createTestLogger } from "../test-utils/test-logger.js";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { compile } from "./compile.js";
import { compileResult } from "./compile-result.js";
import { createFinnaContext, reportWarning } from "./context.js";
import { clearOperators, registerOperator } from "./operators/operator-registry.js";
import { registerAllOperators } from "./operators/register-all.js";
import type { FilterPredicate } from "./types.js";

describe("compileResult", () => {
  beforeEach(() => {
    clearOperators();
    registerAllOperators();
  });
  afterEach(clearOperators);

  it("returns a predicate supporting $field and the supplied context", () => {
    const ctx = createFinnaContext({ throwErrors: false });
    const result = compileResult({ value: { $eq: { $field: "expected.value" } } }, ctx);
    expect(result.context).toBe(ctx);
    expect(result.predicate?.({ value: 5, expected: { value: 5 } })).toBe(true);
    expect(result.predicate?.({ value: 5, expected: { value: 6 } })).toBe(false);
  });

  it("throws by default and returns no partial predicate when disabled", () => {
    expect(() => compileResult({ value: { $unknown: true } })).toThrow(AggregateError);
    const ctx = createFinnaContext({ throwErrors: false });
    const result = compileResult({ a: { $in: 1 }, b: { $unknown: true } }, ctx);
    expect(result.predicate).toBeNull();
    expect(ctx.errors).toHaveLength(2);
    expect(ctx.errors.map((error: any) => error.path)).toEqual([
      ["a", "$in"],
      ["b", "$unknown"],
    ]);
    expect(compileResult({ value: 5 }, ctx).predicate?.({ value: 5 })).toBe(true);
    expect(ctx.errors).toHaveLength(2);
    expect(() => compile({ value: { $unknown: true } }, ctx)).toThrow(AggregateError);
  });

  it("keeps escalated warnings in warnings, logs once, and returns no predicate", () => {
    const { warn, error } = createTestLogger();
    registerOperator("$advised", (_, ctx) => {
      reportWarning(ctx, new Error("advice"));
      return (() => true) as unknown as FilterPredicate;
    });
    const ctx = createFinnaContext({ throwErrors: false, warningsAsErrors: true, logger: { warn, error } });
    expect(compileResult({ value: { $advised: true } }, ctx).predicate).toBeNull();
    expect(ctx.errors).toHaveLength(0);
    expect(ctx.warnings).toHaveLength(1);
    expect(warn).toHaveBeenCalledTimes(1);
    expect(error).not.toHaveBeenCalled();
    expect(warn.mock.calls[0][0]).toMatchObject({ severity: "warning", phase: "compile", path: ["value", "$advised"] });
    expect(compileResult({ value: 5 }, ctx).predicate?.({ value: 5 })).toBe(true);
  });

  it("collects nonfatal compilation warnings without affecting the predicate", () => {
    registerOperator("$advised", (_, ctx) => {
      reportWarning(ctx, "advice");
      return (() => true) as unknown as FilterPredicate;
    });
    const ctx = createFinnaContext();
    expect(compileResult({ value: { $advised: true } }, ctx).predicate?.({ value: 5 })).toBe(true);
    expect(ctx.errors).toEqual([]);
    expect(ctx.warnings).toHaveLength(1);
  });
});
