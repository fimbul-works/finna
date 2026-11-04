import { describe, expect, it } from "vitest";
import { compile } from "../../compile.js";
import { createFinnaContext } from "../../context.js";
import { createEqPredicate } from "../equality/eq.js";
import { registerOperator } from "../operator-registry.js";
import { createIsObjectPredicate } from "./is-object.js";

describe("createIsObjectPredicate", () => {
  it("checks the type and its inverse", () => {
    for (const expected of [true, false]) {
      const predicate = createIsObjectPredicate(expected, createFinnaContext());
      for (const value of [{}, new Date()]) expect(predicate(value)).toBe(expected);
      for (const value of [null, [], "x"]) expect(predicate(value)).toBe(!expected);
    }
  });

  it.each([undefined, null, "true", 1, {}])("rejects non-boolean arguments %j", (expected) => {
    expect(() => createIsObjectPredicate(expected, createFinnaContext())).toThrow(TypeError);
  });

  it("combines its type check with a $field comparison on the same value", () => {
    const undoType = registerOperator("$isObject", createIsObjectPredicate);
    const undoEq = registerOperator("$eq", createEqPredicate);
    try {
      const predicate = compile({ value: { $isObject: true, $eq: { $field: "expected.value" } } });
      const value = { count: 1 };
      expect(predicate({ value, expected: { value } })).toBe(true);
      expect(predicate({ value, expected: { value: null } })).toBe(false);
      const wrongType = [];
      expect(predicate({ value: wrongType, expected: { value: wrongType } })).toBe(false);
    } finally {
      undoType();
      undoEq();
    }
  });
});
