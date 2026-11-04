import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { compile } from "../../compile.js";
import { createFinnaContext } from "../../context.js";
import { clearOperators } from "../operator-registry.js";
import { registerAllOperators } from "../register-all.js";
import { createLowercasePredicate } from "./lowercase.js";

describe("createLowercasePredicate", () => {
  beforeEach(() => {
    clearOperators();
    registerAllOperators();
  });
  afterEach(clearOperators);

  it("tests a transformed string without mutating the document or context", () => {
    const ctx = createFinnaContext();
    const document = Object.freeze({ name: "Alice" });
    const predicate = compile({ name: { $lowercase: { $eq: "alice" } } }, ctx);
    expect(predicate(document)).toBe(true);
    expect(predicate({ name: "Bob" })).toBe(false);
    expect(document.name).toBe("Alice");
    expect(ctx).toEqual({ useUTC: false, errors: [] });
  });

  it("preserves the original root for nested $field comparisons", () => {
    const predicate = compile({ "profile.name": { $lowercase: { $eq: { $field: "expected.name" } } } });
    expect(predicate({ profile: { name: "Alice" }, expected: { name: "alice" } })).toBe(true);
    expect(predicate({ profile: { name: "Alice" }, expected: { name: "Alice" } })).toBe(false);
    expect(predicate({ profile: { name: "Alice" } })).toBe(false);
  });

  it("keeps sibling predicates independent of the transformation", () => {
    const predicate = compile({ name: { $lowercase: { $eq: "alice" }, $startsWith: "A" } });
    expect(predicate({ name: "Alice" })).toBe(true);
    expect(predicate({ name: "alice" })).toBe(false);
  });

  it("supports literals and predicate functions as nested filters", () => {
    expect(createLowercasePredicate("alice", createFinnaContext())("Alice")).toBe(true);
    const predicate = createLowercasePredicate(
      (value: string, root: any) => value === root.expected,
      createFinnaContext(),
    );
    expect(predicate("Alice", { expected: "alice" })).toBe(true);
    expect(predicate("Alice", { expected: "other" })).toBe(false);
    expect(createLowercasePredicate("", createFinnaContext())("")).toBe(true);
  });

  it.each([null, undefined, 0, false, [], {}, new String("Alice")])("rejects non-string input %j", (value) => {
    expect(createLowercasePredicate(() => true, createFinnaContext())(value)).toBe(false);
  });

  it("reports nested compilation failures", () => {
    expect(() => compile({ name: { $lowercase: { $unknown: true } } })).toThrow(AggregateError);
  });
});
