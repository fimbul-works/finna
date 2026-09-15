import { describe, expect, it } from "vitest";
import { createFinnaContext } from "../context.js";
import { createComparisonPredicate } from "./comparison.js";

describe("createComparisonPredicate", () => {
  it("should handle $gt", () => {
    const p = createComparisonPredicate("$gt", 10, createFinnaContext());
    expect(p(11)).toBe(true);
    expect(p(10)).toBe(false);
  });

  it("should handle $gte", () => {
    const p = createComparisonPredicate("$gte", 10, createFinnaContext());
    expect(p(11)).toBe(true);
    expect(p(10)).toBe(true);
    expect(p(9)).toBe(false);
  });

  it("should handle $lt", () => {
    const p = createComparisonPredicate("$lt", 10, createFinnaContext());
    expect(p(9)).toBe(true);
    expect(p(10)).toBe(false);
  });

  it("should handle $lte", () => {
    const p = createComparisonPredicate("$lte", 10, createFinnaContext());
    expect(p(9)).toBe(true);
    expect(p(10)).toBe(true);
    expect(p(11)).toBe(false);
  });
});
