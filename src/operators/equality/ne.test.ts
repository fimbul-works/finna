import { describe, expect, it } from "vitest";
import { createFinnaContext } from "../../context.js";
import { createNePredicate } from "./ne.js";

describe("createNePredicate", () => {
  it("compares literals and nested values using deep equality", () => {
    expect(createNePredicate("foo", createFinnaContext())("foo")).toBe(false);
    expect(createNePredicate("foo", createFinnaContext())("bar")).toBe(true);
    const predicate = createNePredicate({ tags: [1, { active: true }] }, createFinnaContext());
    expect(predicate({ tags: [1, { active: true }] })).toBe(false);
    expect(predicate({ tags: [1, { active: false }] })).toBe(true);
    expect(createNePredicate(new Date(10), createFinnaContext())(new Date(10))).toBe(false);
  });
  it("resolves nested root field references", () => {
    const predicate = createNePredicate({ $field: "profile.name" }, createFinnaContext());
    expect(predicate("foo", { profile: { name: "foo" } })).toBe(false);
    expect(predicate("bar", { profile: { name: "foo" } })).toBe(true);
  });
});
