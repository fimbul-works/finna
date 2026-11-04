import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { compile } from "../../compile.js";
import { match } from "../../match.js";
import { clearOperators, listOperators } from "../operator-registry.js";
import { registerEqualityOperators } from "./index.js";

describe("equality operators integration", () => {
  beforeEach(clearOperators);
  afterEach(clearOperators);

  it("registers and unregisters the category together", () => {
    const unregister = registerEqualityOperators();
    expect([...listOperators().keys()].sort()).toEqual(["$eq", "$in", "$ne", "$nin"]);
    unregister();
    expect(listOperators().size).toBe(0);
    expect(() => compile({ value: { $eq: 1 } })).toThrow(AggregateError);
  });

  it("combines registered predicates in a compiled query", () => {
    registerEqualityOperators();

    const predicate = compile({
      role: { $eq: { $field: "requiredRole" }, $ne: "guest", $in: ["admin", "editor"], $nin: ["banned"] },
    });
    expect(predicate({ role: "admin", requiredRole: "admin" })).toBe(true);
    expect(predicate({ role: "admin", requiredRole: "editor" })).toBe(false);
    expect(predicate({ role: "guest", requiredRole: "guest" })).toBe(false);
    expect(predicate({ role: "owner", requiredRole: "owner" })).toBe(false);
    expect(predicate({ role: "banned", requiredRole: "banned" })).toBe(false);
  });
  it("should match equality operators in core", () => {
    registerEqualityOperators();
    expect(match({ x: 10 }, { x: { $eq: 10 } })).toBe(true);
    expect(match({ x: 10 }, { x: { $ne: 5 } })).toBe(true);
    expect(match({ x: 10 }, { x: { $in: [5, 10, 15] } })).toBe(true);
    expect(match({ x: 10 }, { x: { $nin: [1, 2, 3] } })).toBe(true);
  });
});
