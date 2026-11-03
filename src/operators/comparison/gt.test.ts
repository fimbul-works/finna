import { describe, expect, it } from "vitest";
import { createFinnaContext } from "../../context.js";
import { createGtPredicate } from "./gt.js";

describe("createGtPredicate", () => {
  it("compares values at and around the boundary", () => {
    const predicate = createGtPredicate(10, createFinnaContext());
    expect(predicate(11)).toBe(true);
    expect(predicate(10)).toBe(false);
    expect(predicate(9)).toBe(false);
  });
  it("resolves field references against each root value", () => {
    const predicate = createGtPredicate({ $field: "limits.threshold" }, createFinnaContext());
    expect(predicate(11, { limits: { threshold: 10 } })).toBe(true);
    expect(predicate(9, { limits: { threshold: 10 } })).toBe(false);
  });
  it("compares strings and dates", () => {
    expect(createGtPredicate("b", createFinnaContext())("c")).toBe(true);
    expect(createGtPredicate(new Date(10), createFinnaContext())(new Date(9))).toBe(false);
  });
});
