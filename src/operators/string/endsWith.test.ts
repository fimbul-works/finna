import { describe, expect, it } from "vitest";
import { createFinnaContext } from "../../context.js";
import { createEndsWithPredicate } from "./endsWith.js";

describe("createEndsWithPredicate", () => {
  it("matches the requested text", () => {
    const predicate = createEndsWithPredicate("foo", createFinnaContext());
    expect(predicate("barfoo")).toBe(true);
    expect(predicate("foobar")).toBe(false);
  });
  it("resolves field references and converts expected values to strings", () => {
    const predicate = createEndsWithPredicate({ $field: "search.text" }, createFinnaContext());
    expect(predicate("barfoo", { search: { text: "foo" } })).toBe(true);
    expect(predicate("barfoo", { search: { text: "missing" } })).toBe(false);
    expect(createEndsWithPredicate(42, createFinnaContext())("42")).toBe(true);
  });
  it.each([null, undefined, 42, {}, []])("rejects non-string input %j", (actual) => {
    expect(createEndsWithPredicate("foo", createFinnaContext())(actual)).toBe(false);
  });
});
