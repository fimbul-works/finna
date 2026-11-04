import { beforeEach } from "vitest";
import { registerAllOperators } from "../index.js";

beforeEach(() => {
  registerAllOperators();
});

import { describe, expect, it } from "vitest";
import { match } from "../index.js";

describe("field reference ($field)", () => {
  const doc = {
    price: 100,
    cost: 80,
    comparePrice: 100,
    tags: ["a", "b"],
    otherTags: ["a", "c"],
  };

  it("should handle $eq with $field", () => {
    expect(match(doc, { price: { $eq: { $field: "comparePrice" } } })).toBe(true);
    expect(match(doc, { price: { $eq: { $field: "cost" } } })).toBe(false);
  });

  it("should handle $gt with $field", () => {
    expect(match(doc, { price: { $gt: { $field: "cost" } } })).toBe(true);
    expect(match(doc, { cost: { $gt: { $field: "price" } } })).toBe(false);
  });

  it("should handle $lt with $field", () => {
    expect(match(doc, { cost: { $lt: { $field: "price" } } })).toBe(true);
    expect(match(doc, { price: { $lt: { $field: "cost" } } })).toBe(false);
  });

  it("should work with nested paths in $field", () => {
    const nestedDoc = {
      product: { price: 100 },
      budget: 150,
      stats: { cost: 80 },
    };
    expect(match(nestedDoc, { "product.price": { $lt: { $field: "budget" } } })).toBe(true);
    expect(match(nestedDoc, { "product.price": { $gt: { $field: "stats.cost" } } })).toBe(true);
  });
});
