import { describe, expect, it } from "vitest";
import { createFinnaContext } from "../../context.js";
import { createIncludesPredicate } from "./includes.js";

describe("createIncludesPredicate", () => {
  it("matches the requested text", () => {
    const predicate = createIncludesPredicate("foo", createFinnaContext());
    expect(predicate("barfoobaz")).toBe(true);
    expect(predicate("barbaz")).toBe(false);
  });
  it("resolves field references and converts expected values to strings", () => {
    const predicate = createIncludesPredicate({ $field: "search.text" }, createFinnaContext());
    expect(predicate("barfoobaz", { search: { text: "foo" } })).toBe(true);
    expect(predicate("barfoobaz", { search: { text: "missing" } })).toBe(false);
    expect(createIncludesPredicate(42, createFinnaContext())("42")).toBe(true);
  });
  it.each([null, undefined, 42, {}, []])("rejects non-string input %j", (actual) => {
    expect(createIncludesPredicate("foo", createFinnaContext())(actual)).toBe(false);
  });
});
