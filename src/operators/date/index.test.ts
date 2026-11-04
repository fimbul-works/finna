import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { compile } from "../../compile.js";
import { createPredicate } from "../../predicate.js";
import { registerComparisonOperators } from "../comparison/index.js";
import { clearOperators, listOperators } from "../operator-registry.js";
import { registerDateOperators } from "./index.js";

describe("date operators integration", () => {
  beforeEach(clearOperators);
  afterEach(clearOperators);

  it("registers and unregisters the category together", () => {
    const unregister = registerDateOperators();
    expect([...listOperators().keys()].sort()).toEqual([
      "$date",
      "$hour",
      "$minute",
      "$month",
      "$ms",
      "$second",
      "$utc",
      "$weekday",
      "$year",
    ]);
    unregister();
    expect(listOperators().size).toBe(0);
    expect(() => compile({ value: { $year: 1 } })).toThrow(AggregateError);
  });

  it("combines registered predicates in a compiled query", () => {
    registerDateOperators();
    registerComparisonOperators();
    const predicate = compile({
      created: {
        $utc: {
          $year: 2023,
          $month: 9,
          $date: { $gte: 20, $lte: 25 },
          $weekday: 1,
          $hour: 12,
          $minute: 30,
          $second: 45,
          $ms: 500,
        },
      },
    });
    const date = new Date("2023-10-23T12:30:45.500Z");
    expect(predicate({ created: date })).toBe(true);
    expect(predicate({ created: date.getTime() })).toBe(true);
    for (const other of [
      "2024-10-23T12:30:45.500Z",
      "2023-09-23T12:30:45.500Z",
      "2023-10-24T12:30:45.500Z",
      "2023-10-23T13:30:45.500Z",
      "2023-10-23T12:31:45.500Z",
      "2023-10-23T12:30:46.500Z",
      "2023-10-23T12:30:45.501Z",
    ]) {
      expect(predicate({ created: new Date(other) })).toBe(false);
    }
  });
  it("uses $field with category-registered factories", () => {
    registerDateOperators();
    registerComparisonOperators();
    const predicate = compile({ created: { $utc: { $year: { $gte: { $field: "limits.year" } } } } });
    expect(predicate({ created: new Date("2023-01-01T00:00:00Z"), limits: { year: 2023 } })).toBe(true);
    expect(predicate({ created: new Date("2023-01-01T00:00:00Z"), limits: { year: 2024 } })).toBe(false);
  });

  it("should not match date operators until registered", () => {
    const date = new Date("2024-05-10T00:00:00Z");

    expect(() => createPredicate({ $year: 2024 })).toThrow();

    // Register date operators
    registerDateOperators();
    const pDateAfter = createPredicate({ $year: 2024 });
    expect(pDateAfter(date)).toBe(true);
  });
});
