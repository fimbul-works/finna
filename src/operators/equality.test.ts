import { describe, expect, it } from "vitest";
import { createFinnaContext } from "../context.js";
import { createEqualityPredicate } from "./equality.js";

describe("createEqualityPredicate", () => {
  const ctx = createFinnaContext();

  it("should handle $eq", () => {
    const p = createEqualityPredicate("$eq", "foo", ctx);
    expect(p("foo")).toBe(true);
    expect(p("bar")).toBe(false);
  });

  it("should handle $ne", () => {
    const p = createEqualityPredicate("$ne", "foo", ctx);
    expect(p("foo")).toBe(false);
    expect(p("bar")).toBe(true);
  });

  it("should handle $in", () => {
    const p = createEqualityPredicate("$in", ["foo", "bar"], ctx);
    expect(p("foo")).toBe(true);
    expect(p("bar")).toBe(true);
    expect(p("baz")).toBe(false);
  });

  it("should handle $nin", () => {
    const p = createEqualityPredicate("$nin", ["foo", "bar"], ctx);
    expect(p("foo")).toBe(false);
    expect(p("bar")).toBe(false);
    expect(p("baz")).toBe(true);
  });
});
