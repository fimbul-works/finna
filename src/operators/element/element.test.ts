import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { compile } from "../../compile.js";
import { clearOperators, listOperators } from "../operator-registry.js";
import { registerElementOperators } from "./index.js";

describe("element operators integration", () => {
  beforeEach(clearOperators);
  afterEach(clearOperators);

  it("registers and unregisters the category together", () => {
    const unregister = registerElementOperators();
    expect([...listOperators().keys()].sort()).toEqual(["$exists","$falsy","$nullish","$truthy", "$type"]);
    unregister();
    expect(listOperators().size).toBe(0);
    expect(() => compile({ value: { $exists: 1 } })).toThrow(AggregateError);
  });

  it("combines registered predicates in a compiled query", () => {
    registerElementOperators();

    const predicate = compile({
      name: { $exists: true, $type: "string" },
      removed: { $exists: false, $type: "undefined" },
    });
    expect(predicate({ name: "Alice" })).toBe(true);
    expect(predicate({})).toBe(false);
    expect(predicate({ name: 123 })).toBe(false);
    expect(predicate({ name: "Alice", removed: null })).toBe(false);
  });
});
