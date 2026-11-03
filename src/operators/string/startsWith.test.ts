import { describe, expect, it } from "vitest";
import { createFinnaContext } from "../../context.js";
import { createStartsWithPredicate } from "./startsWith.js";

describe("createStartsWithPredicate", () => {
  it("matches the requested text", () => {
    const predicate = createStartsWithPredicate("foo", createFinnaContext());
    expect(predicate("foobar")).toBe(true);
    expect(predicate("barfoo")).toBe(false);
  });
  it("resolves field references and converts expected values to strings", () => {
    const predicate = createStartsWithPredicate({ $field: "search.text" }, createFinnaContext());
    expect(predicate("foobar", { search: { text: "foo" } })).toBe(true);
    expect(predicate("foobar", { search: { text: "missing" } })).toBe(false);
    expect(createStartsWithPredicate(42, createFinnaContext())("42")).toBe(true);
  });
  it.each([null, undefined, 42, {}, []])("rejects non-string input %j", (actual) => {
    expect(createStartsWithPredicate("foo", createFinnaContext())(actual)).toBe(false);
  });
});
