import { describe, expect, it } from "vitest";
import { createFinnaContext } from "../../context.js";
import { createLtePredicate } from "./lte.js";

describe("createLtePredicate", () => {
  it("compares values at and around the boundary", () => {
    const predicate = createLtePredicate(10, createFinnaContext());
    expect(predicate(11)).toBe(false);
    expect(predicate(10)).toBe(true);
    expect(predicate(9)).toBe(true);
  });
  it("resolves field references against each root value", () => {
    const predicate = createLtePredicate({ $field: "limits.threshold" }, createFinnaContext());
    expect(predicate(11, { limits: { threshold: 10 } })).toBe(false);
    expect(predicate(9, { limits: { threshold: 10 } })).toBe(true);
  });
  it("compares strings and dates", () => {
    expect(createLtePredicate("b", createFinnaContext())("c")).toBe(false);
    expect(createLtePredicate(new Date(10), createFinnaContext())(new Date(9))).toBe(true);
  });
});
