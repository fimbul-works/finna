import { describe, expect, it } from "vitest";
import { createQueryContext } from "../predicate.js";
import { createComparisonPredicate } from "./comparison.js";

describe("createComparisonPredicate", () => {
  it("should handle $gt", () => {
    const p = createComparisonPredicate("$gt", 10, createQueryContext());
    expect(p(11)).toBe(true);
    expect(p(10)).toBe(false);
  });

  it("should handle $gte", () => {
    const p = createComparisonPredicate("$gte", 10, createQueryContext());
    expect(p(11)).toBe(true);
    expect(p(10)).toBe(true);
    expect(p(9)).toBe(false);
  });

  it("should handle $lt", () => {
    const p = createComparisonPredicate("$lt", 10, createQueryContext());
    expect(p(9)).toBe(true);
    expect(p(10)).toBe(false);
  });

  it("should handle $lte", () => {
    const p = createComparisonPredicate("$lte", 10, createQueryContext());
    expect(p(9)).toBe(true);
    expect(p(10)).toBe(true);
    expect(p(11)).toBe(false);
  });
});
