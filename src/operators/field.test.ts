import { describe, expect, it } from "vitest";
import { query } from "../index.js";

describe("field comparison ($field)", () => {
  const doc = {
    price: 100,
    cost: 80,
    comparePrice: 100,
    tags: ["a", "b"],
    otherTags: ["a", "c"],
  };

  it("should handle $eq with $field", () => {
    expect(query(doc, { price: { $eq: { $field: "comparePrice" } } })).toBe(true);
    expect(query(doc, { price: { $eq: { $field: "cost" } } })).toBe(false);
  });

  it("should handle $gt with $field", () => {
    expect(query(doc, { price: { $gt: { $field: "cost" } } })).toBe(true);
    expect(query(doc, { cost: { $gt: { $field: "price" } } })).toBe(false);
  });

  it("should handle $lt with $field", () => {
    expect(query(doc, { cost: { $lt: { $field: "price" } } })).toBe(true);
    expect(query(doc, { price: { $lt: { $field: "cost" } } })).toBe(false);
  });

  it("should work with nested paths in $field", () => {
    const nestedDoc = {
      product: { price: 100 },
      budget: 150,
      stats: { cost: 80 },
    };
    expect(query(nestedDoc, { "product.price": { $lt: { $field: "budget" } } })).toBe(true);
    expect(query(nestedDoc, { "product.price": { $gt: { $field: "stats.cost" } } })).toBe(true);
  });
});

describe("array sub-queries", () => {
  const doc = {
    users: [
      { name: "John", age: 30 },
      { name: "Jane", age: 25 },
      { name: "Bob", age: 40 },
    ],
    threshold: 20,
  };

  it("should handle $some with sub-query", () => {
    expect(query(doc, { users: { $some: { age: { $gt: 35 } } } })).toBe(true);
    expect(query(doc, { users: { $some: { age: { $lt: 20 } } } })).toBe(false);
  });

  it("should handle $all with sub-query", () => {
    expect(query(doc, { users: { $all: { age: { $gt: 20 } } } })).toBe(true);
    expect(query(doc, { users: { $all: { age: { $gt: 30 } } } })).toBe(false);
  });

  it("should handle $none with sub-query", () => {
    expect(query(doc, { users: { $none: { age: { $lt: 20 } } } })).toBe(true);
    expect(query(doc, { users: { $none: { age: { $gt: 35 } } } })).toBe(false);
  });

  it("should support $field inside array sub-query", () => {
    expect(query(doc, { users: { $some: { age: { $gt: { $field: "threshold" } } } } })).toBe(true);
  });
});

describe("deep equality and exact query", () => {
  const doc = {
    profile: { name: "John", age: 30 },
    tags: ["a", "b"],
  };

  it("should handle deep equality with naked arrays", () => {
    expect(query(doc, { tags: ["a", "b"] })).toBe(true);
    expect(query(doc, { tags: ["a", "c"] })).toBe(false);
    expect(query(doc, { tags: ["a"] })).toBe(false);
  });

  it("should handle partial match with naked objects", () => {
    expect(query(doc, { profile: { name: "John" } })).toBe(true);
  });

  it("should handle exact match with $eq for objects", () => {
    expect(query(doc, { profile: { $eq: { name: "John", age: 30 } } })).toBe(true);
    expect(query(doc, { profile: { $eq: { name: "John" } } })).toBe(false);
  });

  it("should handle deep equality in $in", () => {
    expect(
      query(doc, {
        tags: {
          $in: [
            ["a", "b"],
            ["x", "y"],
          ],
        },
      }),
    ).toBe(true);
    expect(query(doc, { tags: { $in: [["a"], ["b"]] } })).toBe(false);
  });
});
