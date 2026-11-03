import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { compile } from "../../compile.js";
import { clearOperators, listOperators } from "../operator-registry.js";
import { registerStringOperators } from "./index.js";

describe("string operators integration", () => {
  beforeEach(clearOperators);
  afterEach(clearOperators);

  it("registers and unregisters the category together", () => {
    const unregister = registerStringOperators();
    expect([...listOperators().keys()].sort()).toEqual(["$endsWith", "$includes", "$regex", "$startsWith"]);
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
});
