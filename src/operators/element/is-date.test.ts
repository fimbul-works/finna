import { describe, expect, it } from "vitest";
import { compile } from "../../compile.js";
import { createFinnaContext } from "../../context.js";
import { createEqPredicate } from "../equality/eq.js";
import { registerOperator } from "../operator-registry.js";
import { createIsDatePredicate } from "./is-date.js";

describe("createIsDatePredicate", () => {
  it("checks the type and its inverse", () => {
    for (const expected of [true, false]) {
      const predicate = createIsDatePredicate(expected, createFinnaContext());
      for (const value of [new Date(), new Date(NaN)]) expect(predicate(value)).toBe(expected);
      for (const value of [0, "2024-01-01", {}]) expect(predicate(value)).toBe(!expected);
    }
  });

  it.each([undefined, null, "true", 1, {}])("rejects non-boolean arguments %j", (expected) => {
    expect(() => createIsDatePredicate(expected, createFinnaContext())).toThrow(TypeError);
  });

  it("combines its type check with a $field comparison on the same value", () => {
    const undoType = registerOperator("$isDate", createIsDatePredicate);
    const undoEq = registerOperator("$eq", createEqPredicate);
    try {
      const predicate = compile({ value: { $isDate: true, $eq: { $field: "expected.value" } } });
      const value = new Date(0);
      expect(predicate({ value, expected: { value } })).toBe(true);
      expect(predicate({ value, expected: { value: null } })).toBe(false);
      const wrongType = 0;
      expect(predicate({ value: wrongType, expected: { value: wrongType } })).toBe(false);
    } finally {
      undoType();
      undoEq();
    }
  });
});
