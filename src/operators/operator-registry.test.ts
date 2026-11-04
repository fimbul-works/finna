import { beforeEach, describe, expect, it } from "vitest";
import {
  clearOperators,
  compile,
  createGtPredicate,
  createPredicate,
  type FilterPredicate,
  getOperator,
  hasOperator,
  listOperators,
  type OperatorFactory,
  operatorMap,
  registerOperator,
  registerOperators,
  unregisterOperator,
} from "../index.js";

const always = (() => true) as unknown as FilterPredicate;
const first: OperatorFactory = () => always;
const second: OperatorFactory = () => (() => false) as unknown as FilterPredicate;

describe("operator registry", () => {
  beforeEach(clearOperators);

  it("registers a single independently usable factory and exposes its function", () => {
    registerOperator("$gt", createGtPredicate);
    expect([...operatorMap.keys()]).toEqual(["$gt"]);
    expect(hasOperator("$gt")).toBe(true);
    expect(getOperator("$gt")).toBe(createGtPredicate);
    const snapshot = listOperators();
    snapshot.clear();
    expect(hasOperator("$gt")).toBe(true);
    expect(compile({ age: { $gt: 18 } })({ age: 20 })).toBe(true);
    expect(() => compile({ age: { $eq: 20 } })).toThrow(AggregateError);
  });

  it("compiles custom operators eagerly and preserves compiled functions after unregistering", () => {
    const unregister = registerOperator(
      "$between",
      (expected: [number, number]) =>
        ((actual: any) =>
          typeof actual === "number" && actual >= expected[0] && actual <= expected[1]) as FilterPredicate,
    );
    const predicate = createPredicate({ score: { $between: [10, 20] } });
    expect(predicate({ score: 15 })).toBe(true);
    expect(predicate({ score: 25 })).toBe(false);
    unregister();
    expect(predicate({ score: 15 })).toBe(true);
    expect(() => createPredicate({ score: { $between: [10, 20] } })).toThrow(AggregateError);
  });

  it("makes identical registration idempotent without transferring cleanup ownership", () => {
    const undo = registerOperator("$custom", first);
    const duplicateUndo = registerOperator("$custom", first);
    duplicateUndo();
    expect(getOperator("$custom")).toBe(first);
    undo();
    expect(hasOperator("$custom")).toBe(false);
  });

  it("requires explicit replacement and protects replacements from stale cleanup", () => {
    const undo = registerOperator("$custom", first);
    expect(() => registerOperator("$custom", second)).toThrow("already registered");
    registerOperator("$custom", second, { replace: true });
    undo();
    expect(getOperator("$custom")).toBe(second);
    expect(unregisterOperator("$custom")).toBe(true);
    expect(unregisterOperator("$custom")).toBe(false);
  });

  it("does not let stale cleanup remove the same factory registered again after clearing", () => {
    const undo = registerOperator("$custom", first);
    clearOperators();
    registerOperator("$custom", first);
    undo();
    expect(hasOperator("$custom")).toBe(true);
  });

  it("rejects batches atomically, including conflicting entries within a batch", () => {
    registerOperator("$custom", first);
    expect(() =>
      registerOperators([
        ["$new", first],
        ["$custom", second],
      ]),
    ).toThrow();
    expect(hasOperator("$new")).toBe(false);
    expect(() =>
      registerOperators([
        ["$new", first],
        ["$new", second],
      ]),
    ).toThrow();
    expect(hasOperator("$new")).toBe(false);
    // @ts-expect-error Invalid names are also rejected at runtime for JavaScript callers.
    expect(() => registerOperator("bad", first)).toThrow(TypeError);
  });

  it("retains $field resolution in predicates compiled before cleanup", () => {
    const undo = registerOperator("$gt", createGtPredicate);
    const predicate = compile({ value: { $gt: { $field: "limits.minimum" } } });
    undo();
    expect(predicate({ value: 10, limits: { minimum: 9 } })).toBe(true);
    expect(predicate({ value: 10, limits: { minimum: 10 } })).toBe(false);
    expect(hasOperator("$gt")).toBe(false);
  });
});
