import { describe, expect, it } from "vitest";
import { compile } from "../../compile.js";
import { createFinnaContext } from "../../context.js";
import { createEqPredicate } from "../equality/eq.js";
import { registerOperator } from "../operator-registry.js";
import { createIsClassPredicate } from "./is-class.js";

class Example {
  constructor(public id = 1) {}
}
class Child extends Example {}

describe("createIsClassPredicate", () => {
  it("checks instances and subclasses", () => {
    const predicate = createIsClassPredicate(Example, createFinnaContext());
    expect(predicate(new Example())).toBe(true);
    expect(predicate(new Child())).toBe(true);
    expect(predicate({ id: 1 })).toBe(false);
  });
  it.each([null, {}, () => true, "Example"])("rejects invalid constructors %j", (value) => {
    expect(() => createIsClassPredicate(value, createFinnaContext())).toThrow(TypeError);
  });
  it("combines the class check with a $field comparison", () => {
    const undoClass = registerOperator("$isClass", createIsClassPredicate);
    const undoEq = registerOperator("$eq", createEqPredicate);
    try {
      const predicate = compile({ value: { $isClass: Example, $eq: { $field: "expected.value" } } });
      expect(predicate({ value: new Example(1), expected: { value: new Example(1) } })).toBe(true);
      expect(predicate({ value: new Example(1), expected: { value: new Example(2) } })).toBe(false);
      expect(predicate({ value: { id: 1 }, expected: { value: { id: 1 } } })).toBe(false);
    } finally {
      undoClass();
      undoEq();
    }
  });
});
