import { describe, expect, it } from "vitest";
import { createQueryContext } from "../predicate.js";
import { createStringPredicate } from "./string.js";

describe("createStringPredicate", () => {
  const ctx = createQueryContext();

  it("should handle $regex", () => {
    const p = createStringPredicate("$regex", /^foo/, ctx);
    expect(p("foobar")).toBe(true);
    expect(p("barfoo")).toBe(false);
  });

  it("should handle $startsWith", () => {
    const p = createStringPredicate("$startsWith", "foo", ctx);
    expect(p("foobar")).toBe(true);
    expect(p("barfoo")).toBe(false);
  });

  it("should handle $endsWith", () => {
    const p = createStringPredicate("$endsWith", "foo", ctx);
    expect(p("barfoo")).toBe(true);
    expect(p("foobar")).toBe(false);
  });

  it("should handle $includes", () => {
    const p = createStringPredicate("$includes", "foo", ctx);
    expect(p("barfoobaz")).toBe(true);
    expect(p("barbaz")).toBe(false);
  });
});
