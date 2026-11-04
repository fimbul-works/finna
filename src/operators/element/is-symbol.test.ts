import { describe, expect, it } from "vitest";
import { compile } from "../../compile.js";
import { createFinnaContext } from "../../context.js";
import { createEqPredicate } from "../equality/eq.js";
import { registerOperator } from "../operator-registry.js";
import { createIsSymbolPredicate } from "./is-symbol.js";

describe("createIsSymbolPredicate", () => {
  it("checks the type and its inverse", () => {
    for (const expected of [true, false]) {
      const predicate = createIsSymbolPredicate(expected, createFinnaContext());
      for (const value of [Symbol(), Symbol.for("x")]) expect(predicate(value)).toBe(expected);
      for (const value of ["x", {}]) expect(predicate(value)).toBe(!expected);
    }
  });

  it.each([undefined, null, "true", 1, {}])("rejects non-boolean arguments %j", (expected) => {
    expect(() => createIsSymbolPredicate(expected, createFinnaContext())).toThrow(TypeError);
  });

  it("combines its type check with a $field comparison on the same value", () => {
    const undoType = registerOperator("$isSymbol", createIsSymbolPredicate);
    const undoEq = registerOperator("$eq", createEqPredicate);
    try {
      const predicate = compile({ value: { $isSymbol: true, $eq: { $field: "expected.value" } } });
      const value = Symbol.for("value");
      expect(predicate({ value, expected: { value } })).toBe(true);
      expect(predicate({ value, expected: { value: null } })).toBe(false);
      const wrongType = "value";
      expect(predicate({ value: wrongType, expected: { value: wrongType } })).toBe(false);
    } finally {
      undoType();
      undoEq();
    }
  });
});
