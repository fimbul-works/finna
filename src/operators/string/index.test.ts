import { match } from "../../match.js";

import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { compile } from "../../compile.js";
import { clearOperators, listOperators } from "../operator-registry.js";
import { registerStringOperators } from "./index.js";

describe("string operators integration", () => {
  beforeEach(clearOperators);
  afterEach(clearOperators);

  it("registers and unregisters the category together", () => {
    const unregister = registerStringOperators();
    expect([...listOperators().keys()].sort()).toEqual([
      "$endsWith",
      "$includes",
      "$lowercase",
      "$regex",
      "$replace",
      "$replaceAll",
      "$startsWith",
      "$uppercase",
    ]);
    unregister();
    expect(listOperators().size).toBe(0);
    expect(() => compile({ value: { $regex: 1 } })).toThrow(AggregateError);
  });

  it("combines registered predicates in a compiled query", () => {
    registerStringOperators();

    const predicate = compile({
      name: { $regex: "^[a-z-]+$", $startsWith: "pre-", $endsWith: "-end", $includes: "middle" },
    });
    expect(predicate({ name: "pre-middle-end" })).toBe(true);
    for (const name of ["pre-middle2-end", "other-middle-end", "pre-middle-other", "pre-other-end"]) {
      expect(predicate({ name })).toBe(false);
    }
  });
  it("uses $field with category-registered factories", () => {
    registerStringOperators();
    const predicate = compile({ value: { $startsWith: { $field: "expected.prefix" } } });
    expect(predicate({ value: "hello", expected: { prefix: "he" } })).toBe(true);
    expect(predicate({ value: "hello", expected: { prefix: "no" } })).toBe(false);
  });

  it("should match string operators in core", () => {
    registerStringOperators();
    expect(match({ name: "Hello World" }, { name: { $startsWith: "Hello" } })).toBe(true);
    expect(match({ name: "Hello World" }, { name: { $endsWith: "World" } })).toBe(true);
    expect(match({ name: "Hello World" }, { name: { $includes: "lo Wo" } })).toBe(true);
    expect(match({ name: "Hello World" }, { name: { $regex: "^Hello" } })).toBe(true);
  });
  it("composes transformations in nesting order and preserves the root for $field", () => {
    registerStringOperators();
    const predicate = compile({
      title: {
        $lowercase: {
          $replaceAll: { search: /\s+/g, replace: "-", then: { $startsWith: { $field: "expected.prefix" } } },
        },
        $startsWith: "Hello",
      },
    });
    const document = { title: "Hello World Again", expected: { prefix: "hello-world-" } };
    expect(predicate(document)).toBe(true);
    expect(predicate({ ...document, expected: { prefix: "Hello" } })).toBe(false);
    expect(document.title).toBe("Hello World Again");
  });
});
