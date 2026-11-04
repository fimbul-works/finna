import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { compile } from "../../compile.js";
import { createFinnaContext } from "../../context.js";
import { clearOperators } from "../operator-registry.js";
import { registerAllOperators } from "../register-all.js";
import { createUppercasePredicate } from "./uppercase.js";

describe("createUppercasePredicate", () => {
  beforeEach(() => {
    clearOperators();
    registerAllOperators();
  });
  afterEach(clearOperators);

  it("tests a transformed string without mutating the document or context", () => {
    const ctx = createFinnaContext();
    const document = Object.freeze({ name: "Alice" });
    const predicate = compile({ name: { $uppercase: { $eq: "ALICE" } } }, ctx);
    expect(predicate(document)).toBe(true);
    expect(predicate({ name: "Bob" })).toBe(false);
    expect(document.name).toBe("Alice");
    expect(ctx).toEqual({ useUTC: false, errors: [] });
  });

  it("preserves the original root for nested $field comparisons", () => {
    const predicate = compile({ "profile.name": { $uppercase: { $eq: { $field: "expected.name" } } } });
    expect(predicate({ profile: { name: "Alice" }, expected: { name: "ALICE" } })).toBe(true);
    expect(predicate({ profile: { name: "Alice" }, expected: { name: "Alice" } })).toBe(false);
    expect(predicate({ profile: { name: "Alice" } })).toBe(false);
  });

  it("keeps sibling predicates independent of the transformation", () => {
    const predicate = compile({ name: { $uppercase: { $eq: "ALICE" }, $startsWith: "A" } });
    expect(predicate({ name: "Alice" })).toBe(true);
    expect(predicate({ name: "alice" })).toBe(false);
  });

  it("supports literals and predicate functions as nested filters", () => {
    expect(createUppercasePredicate("ALICE", createFinnaContext())("Alice")).toBe(true);
    const predicate = createUppercasePredicate(
      (value: string, root: any) => value === root.expected,
      createFinnaContext(),
    );
    expect(predicate("Alice", { expected: "ALICE" })).toBe(true);
    expect(predicate("Alice", { expected: "other" })).toBe(false);
    expect(createUppercasePredicate("", createFinnaContext())("")).toBe(true);
  });

  it.each([null, undefined, 0, false, [], {}, new String("Alice")])("rejects non-string input %j", (value) => {
    expect(createUppercasePredicate(() => true, createFinnaContext())(value)).toBe(false);
  });

  it("reports nested compilation failures", () => {
    expect(() => compile({ name: { $uppercase: { $unknown: true } } })).toThrow(AggregateError);
  });
});
