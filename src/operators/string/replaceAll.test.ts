import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { compile } from "../../compile.js";
import { createFinnaContext } from "../../context.js";
import { clearOperators } from "../operator-registry.js";
import { registerAllOperators } from "../register-all.js";
import { createReplaceAllPredicate } from "./replaceAll.js";

describe("createReplaceAllPredicate", () => {
  beforeEach(() => {
    clearOperators();
    registerAllOperators();
  });
  afterEach(clearOperators);

  it.each([
    ["a a", "a", "b", "b b"],
    ["a.a", ".", "!", "a!a"],
    ["ab", "", "-", "-a-b-"],
    ["hello", "missing", "!", "hello"],
    ["a a", /a/g, "b", "b b"],
    ["Ab A", /a/gi, "x", "xb x"],
    ["abc", /(b)/g, "[$1]-$&", "a[b]-bc"],
    ["a", "a", "$$", "$"],
    ["", "a", "b", ""],
  ])("replaces %s using %s", (value, search, replace, result) => {
    const predicate = createReplaceAllPredicate({ search, replace, then: { $eq: result } }, createFinnaContext());
    expect(predicate(value)).toBe(true);
    expect(
      createReplaceAllPredicate({ search, replace, then: { $eq: "incorrect" } }, createFinnaContext())(value),
    ).toBe(false);
  });

  it("resolves search, replacement, and then $field references on every evaluation", () => {
    const predicate = compile({
      "nested.message": {
        $replaceAll: {
          search: { $field: "rules.search" },
          replace: { $field: "rules.replace" },
          then: { $eq: { $field: "expected.message" } },
        },
      },
    });
    const document = { nested: { message: "a a" }, rules: { search: "a", replace: "b" }, expected: { message: "b b" } };
    expect(predicate(document)).toBe(true);
    expect(predicate({ ...document, expected: { message: "wrong" } })).toBe(false);
    document.rules.search = "b";
    expect(predicate(document)).toBe(false);
    expect(document.nested.message).toBe("a a");
    expect(predicate({ ...document, rules: { search: /a/g, replace: "b" }, expected: { message: "b b" } })).toBe(true);
    expect(predicate({ nested: { message: "a a" } })).toBe(false);
  });

  it("rejects invalid dynamically referenced arguments without recording diagnostics", () => {
    const ctx = createFinnaContext();
    const predicate = compile(
      { value: { $replaceAll: { search: { $field: "search" }, replace: { $field: "replacement" }, then: "b" } } },
      ctx,
    );
    for (const search of [null, undefined, 42, {}, [], /a/]) {
      expect(predicate({ value: "a", search, replacement: "b" })).toBe(false);
    }
    for (const replacement of [null, undefined, 42, {}, []]) {
      expect(predicate({ value: "a", search: "a", replacement })).toBe(false);
    }
    expect(ctx.errors).toEqual([]);
  });

  it("keeps caller-owned regex state unchanged across repeated evaluations", () => {
    const search = /a/gy;
    search.lastIndex = 1;
    const predicate = createReplaceAllPredicate({ search, replace: "b", then: "b" }, createFinnaContext());
    expect(predicate("a")).toBe(true);
    expect(predicate("a")).toBe(true);
    expect(search.lastIndex).toBe(1);
    const referenced = compile({ value: { $replaceAll: { search: { $field: "pattern" }, replace: "b", then: "b" } } });
    expect(referenced({ value: "a", pattern: search })).toBe(true);
    expect(referenced({ value: "a", pattern: search })).toBe(true);
    expect(search.lastIndex).toBe(1);
  });

  it.each([
    null,
    undefined,
    [],
    {},
    { search: "a", replace: "b" },
    { search: 42, replace: "b", then: "b" },
    { search: "a", replace: false, then: "b" },
    { search: { $field: 1 }, replace: "b", then: "b" },
  ])("rejects invalid literal configuration %j", (expected) => {
    expect(() => createReplaceAllPredicate(expected, createFinnaContext())).toThrow(TypeError);
    expect(() => compile({ value: { $replaceAll: expected } })).toThrow(AggregateError);
  });

  it.each([null, undefined, 1, false, [], {}, new String("a")])("rejects non-string input %j", (value) => {
    expect(
      createReplaceAllPredicate({ search: "a", replace: "b", then: () => true }, createFinnaContext())(value),
    ).toBe(false);
  });

  it("supports predicate functions and reports the then path for nested compilation errors", () => {
    const predicate = createReplaceAllPredicate(
      { search: "a", replace: "b", then: (value: string, root: any) => value === root.expected },
      createFinnaContext(),
    );
    expect(predicate("a", { expected: "b" })).toBe(true);
    expect(predicate("a", { expected: "c" })).toBe(false);
    const ctx = createFinnaContext();
    expect(() =>
      compile({ value: { $replaceAll: { search: "a", replace: "b", then: { $unknown: true } } } }, ctx),
    ).toThrow(AggregateError);
    expect((ctx.errors[0] as any).path).toEqual(["value", "$replaceAll", "then", "$unknown"]);
  });

  it("requires a global flag for literal regexes", () => {
    expect(() => createReplaceAllPredicate({ search: /a/, replace: "b", then: "b" }, createFinnaContext())).toThrow(
      TypeError,
    );
  });
});
