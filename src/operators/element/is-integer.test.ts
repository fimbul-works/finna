import { describe, expect, it } from "vitest";
import { compile } from "../../compile.js";
import { createFinnaContext } from "../../context.js";
import { createEqPredicate } from "../equality/eq.js";
import { registerOperator } from "../operator-registry.js";
import { createIsIntegerPredicate } from "./is-integer.js";

describe("createIsIntegerPredicate", () => {
  it("checks the type and its inverse", () => {
    for (const expected of [true, false]) {
      const predicate = createIsIntegerPredicate(expected, createFinnaContext());
      for (const value of [0, -2]) expect(predicate(value)).toBe(expected);
      for (const value of [1.5, NaN, Infinity, 1n]) expect(predicate(value)).toBe(!expected);
    }
  });

  it.each([undefined, null, "true", 1, {}])("rejects non-boolean arguments %j", (expected) => {
    expect(() => createIsIntegerPredicate(expected, createFinnaContext())).toThrow(TypeError);
  });

  it("combines its type check with a $field comparison on the same value", () => {
    const undoType = registerOperator("$isInteger", createIsIntegerPredicate);
    const undoEq = registerOperator("$eq", createEqPredicate);
    try {
      const predicate = compile({ value: { $isInteger: true, $eq: { $field: "expected.value" } } });
      const value = 42;
      expect(predicate({ value, expected: { value } })).toBe(true);
      expect(predicate({ value, expected: { value: null } })).toBe(false);
      const wrongType = 1.5;
      expect(predicate({ value: wrongType, expected: { value: wrongType } })).toBe(false);
    } finally {
      undoType();
      undoEq();
    }
  });
});
