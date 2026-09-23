import { describe, expect, it } from "vitest";
import { match } from "./match.js";
import "./index.js";

describe("match", () => {
  it("should check if a value satisfies a query pattern", () => {
    expect(match<{ name: string; age: number }>({ name: "Alice", age: 30 }, { name: "Alice", age: { $gte: 25 } })).toBe(
      true,
    );
    expect(match<{ name: string; age: number }>({ name: "Bob", age: 20 }, { name: "Alice", age: { $gte: 25 } })).toBe(
      false,
    );
  });

  it("should match nested objects and dotted fields", () => {
    const doc = {
      address: { city: "New York", zip: 10001 },
      meta: { created: 2024 },
    };
    expect(match<typeof doc>(doc, { address: { city: "New York" } })).toBe(true);
    expect(match<typeof doc>(doc, { "address.zip": 10001 })).toBe(true);
    expect(match<typeof doc>(doc, { "meta.created": { $gte: 2020 } })).toBe(true);
  });

  it("should match with predicate functions as field filters", () => {
    const order = {
      items: 3,
      unitPrice: 25,
      budget: 100,
      discount: 0.1,
    };

    // Filter receives value and root
    const satisfiesBudget = match<typeof order>(order, {
      items: (qty, root) => qty * root.unitPrice * (1 - root.discount) <= root.budget,
    });
    expect(satisfiesBudget).toBe(true);

    const overBudget = match<typeof order>(
      { ...order, items: 5 },
      {
        items: (qty, root) => qty * root.unitPrice * (1 - root.discount) <= root.budget,
      },
    );
    expect(overBudget).toBe(false);
  });

  it("should match when query pattern is a root predicate function", () => {
    const doc = { a: 10, b: 20 };
    expect(match<typeof doc>(doc, (val, root) => val.a + root.b === 30)).toBe(true);
    expect(match<typeof doc>(doc, (val, root) => val.a + root.b === 50)).toBe(false);
  });

  it("should match predicate functions inside array operators", () => {
    const doc = {
      scores: [85, 92, 78, 90],
      threshold: 80,
      minScore: 70,
      disallowed: 50,
      expectedCount: 4,
    };

    // $all with predicate
    expect(match<typeof doc>(doc, { scores: { $all: (s: number, root) => s >= root.minScore } })).toBe(true);
    expect(match<typeof doc>(doc, { scores: { $all: (s: number, root) => s >= root.threshold } })).toBe(false);

    // $some with predicate
    expect(match<typeof doc>(doc, { scores: { $some: (s: number, root) => s > root.threshold } })).toBe(true);
    expect(match<typeof doc>(doc, { scores: { $some: (s: number) => s > 100 } })).toBe(false);

    // $none with predicate
    expect(match<typeof doc>(doc, { scores: { $none: (s: number, root) => s === root.disallowed } })).toBe(true);
    expect(match<typeof doc>(doc, { scores: { $none: (s: number) => s === 92 } })).toBe(false);

    // $size with predicate
    expect(match<typeof doc>(doc, { scores: { $size: (size: number, root) => size === root.expectedCount } })).toBe(
      true,
    );
    expect(match<typeof doc>(doc, { scores: { $size: (size: number) => size > 10 } })).toBe(false);
  });

  it("should match predicate functions inside logical operators", () => {
    const doc = { count: 15, limit: 20 };

    expect(
      match<typeof doc>(doc, {
        $and: [(val, root) => val.count < root.limit, { count: { $gt: 10 } }],
      }),
    ).toBe(true);

    expect(
      match<typeof doc>(doc, {
        $or: [(val) => val.count > 50, (val, root) => val.count <= root.limit],
      }),
    ).toBe(true);

    expect(
      match<typeof doc>(doc, {
        $not: (val, root) => val.count >= root.limit,
      }),
    ).toBe(true);

    expect(
      match<typeof doc>(doc, {
        $nor: [(val, root) => val.count > root.limit, (val) => val.count < 0],
      }),
    ).toBe(true);
  });
});
