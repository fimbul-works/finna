import { describe, expect, it } from "vitest";
import { createFinnaContext } from "../../context.js";
import { createEqPredicate } from "./eq.js";

describe("createEqPredicate", () => {
  it("compares literals and nested values using deep equality", () => {
    expect(createEqPredicate("foo", createFinnaContext())("foo")).toBe(true);
    expect(createEqPredicate("foo", createFinnaContext())("bar")).toBe(false);
    const predicate = createEqPredicate({ tags: [1, { active: true }] }, createFinnaContext());
    expect(predicate({ tags: [1, { active: true }] })).toBe(true);
    expect(predicate({ tags: [1, { active: false }] })).toBe(false);
    expect(createEqPredicate(new Date(10), createFinnaContext())(new Date(10))).toBe(true);
  });
  it("resolves nested root field references", () => {
    const predicate = createEqPredicate({ $field: "profile.name" }, createFinnaContext());
    expect(predicate("foo", { profile: { name: "foo" } })).toBe(true);
    expect(predicate("bar", { profile: { name: "foo" } })).toBe(false);
  });
});
