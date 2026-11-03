import { describe, expect, it } from "vitest";
import { createFinnaContext } from "../../context.js";
import { createRegexPredicate } from "./regex.js";

describe("createRegexPredicate", () => {
  it("accepts RegExp instances and regex source strings", () => {
    for (const expected of [/^foo/, "^foo"]) {
      const predicate = createRegexPredicate(expected, createFinnaContext());
      expect(predicate("foobar")).toBe(true);
      expect(predicate("barfoo")).toBe(false);
    }
  });
  it("rejects invalid regex syntax during creation", () => {
    expect(() => createRegexPredicate("[", createFinnaContext())).toThrow(SyntaxError);
  });
  it.each([null, undefined, 42, {}, []])("rejects non-string input %j", (actual) => {
    expect(createRegexPredicate("foo", createFinnaContext())(actual)).toBe(false);
  });
});
