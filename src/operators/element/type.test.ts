import { describe, expect, it } from "vitest";
import { createFinnaContext } from "../../context.js";
import { createTypePredicate } from "./type.js";

describe("createTypePredicate", () => {
  it.each([
    ["string", "hello", 123],
    ["number", 123, "123"],
    ["boolean", false, 0],
    ["null", null, undefined],
    ["undefined", undefined, null],
    ["array", [], {}],
    ["object", {}, []],
    ["date", new Date(0), "1970-01-01"],
    ["bigint", BigInt(123), "123"],
  ])("matches %s values", (type, matching, other) => {
    const predicate = createTypePredicate(type, createFinnaContext());
    expect(predicate(matching)).toBe(true);
    expect(predicate(other)).toBe(false);
  });
  it("excludes null and dates from object matching", () => {
    const predicate = createTypePredicate("object", createFinnaContext());
    expect(predicate(null)).toBe(false);
    expect(predicate(new Date())).toBe(false);
  });
});
