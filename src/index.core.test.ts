import { describe, expect, it, beforeEach } from "vitest";
import { registerArrayOperators } from "./operators/array.js";
import { registerDateOperators } from "./operators/date.js";
import {
  createPredicate,
  query,
  registerComparisonOperators,
  registerElementOperators,
  registerEqualityOperators,
  registerStringOperators,
} from "./index.core.js";
import { clearOperators } from "./operator-registry.js";

describe("core export", () => {
  const resetCore = () => {
    clearOperators();
    registerEqualityOperators();
    registerComparisonOperators();
    registerElementOperators();
    registerStringOperators();
  };

  beforeEach(() => {
    resetCore();
  });

  it("should match equality operators in core", () => {
    expect(query({ x: 10 }, { x: { $eq: 10 } })).toBe(true);
    expect(query({ x: 10 }, { x: { $ne: 5 } })).toBe(true);
    expect(query({ x: 10 }, { x: { $in: [5, 10, 15] } })).toBe(true);
    expect(query({ x: 10 }, { x: { $nin: [1, 2, 3] } })).toBe(true);
  });

  it("should match comparison operators in core", () => {
    expect(query({ age: 25 }, { age: { $gt: 20 } })).toBe(true);
    expect(query({ age: 25 }, { age: { $gte: 25 } })).toBe(true);
    expect(query({ age: 25 }, { age: { $lt: 30 } })).toBe(true);
    expect(query({ age: 25 }, { age: { $lte: 25 } })).toBe(true);
  });

  it("should match element operators in core", () => {
    expect(query({ name: "Alice" }, { name: { $exists: true } })).toBe(true);
    expect(query({ name: "Alice" }, { missing: { $exists: false } })).toBe(true);
    expect(query({ age: 30 }, { age: { $type: "number" } })).toBe(true);
  });

  it("should match string operators in core", () => {
    expect(query({ name: "Hello World" }, { name: { $startsWith: "Hello" } })).toBe(true);
    expect(query({ name: "Hello World" }, { name: { $endsWith: "World" } })).toBe(true);
    expect(query({ name: "Hello World" }, { name: { $includes: "lo Wo" } })).toBe(true);
    expect(query({ name: "Hello World" }, { name: { $regex: "^Hello" } })).toBe(true);
  });

  it("should not match date operators until registered", () => {
    const date = new Date("2024-05-10T00:00:00Z");

    // Before registering date operators, $year returns false
    expect(() => createPredicate({ $year: 2024 })).toThrow();

    // Register date operators
    registerDateOperators();
    const pDateAfter = createPredicate({ $year: 2024 });
    expect(pDateAfter(date)).toBe(true);
  });

  it("should not match array operators until registered", () => {
    const data = { tags: [1, 2, 3] };

    // Before registering array operators, $size returns false
    const pArray = createPredicate({ tags: { $size: 3 } });
    expect(() => pArray(data)).toThrow();

    // Register array operators
    registerArrayOperators();
    const pArrayAfter = createPredicate({ tags: { $size: 3 } });
    expect(pArrayAfter(data)).toBe(true);
  });
});
