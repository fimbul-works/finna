import { describe, expect, it } from "vitest";
import { createFinnaContext } from "../../context.js";
import { createGtePredicate } from "./gte.js";

describe("createGtePredicate", () => {
  it("compares values at and around the boundary", () => {
    const predicate = createGtePredicate(10, createFinnaContext());
    expect(predicate(11)).toBe(true);
    expect(predicate(10)).toBe(true);
    expect(predicate(9)).toBe(false);
  });
  it("resolves field references against each root value", () => {
    const predicate = createGtePredicate({ $field: "limits.threshold" }, createFinnaContext());
    expect(predicate(11, { limits: { threshold: 10 } })).toBe(true);
    expect(predicate(9, { limits: { threshold: 10 } })).toBe(false);
  });
  it("compares strings and dates", () => {
    expect(createGtePredicate("b", createFinnaContext())("c")).toBe(true);
    expect(createGtePredicate(new Date(10), createFinnaContext())(new Date(9))).toBe(false);
  });
});
