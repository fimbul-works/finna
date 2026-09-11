import { describe, expect, it } from "vitest";
import { matches } from "./matcher.js";

describe("query matcher", () => {
  const doc = {
    id: "1",
    name: "John",
    age: 30,
    stats: {
      score: 100,
      level: 5,
    },
    tags: ["a", "b"],
  };

  describe("equality", () => {
    it("should match direct values", () => {
      expect(matches(doc, { name: "John" })).toBe(true);
      expect(matches(doc, { name: "Jane" })).toBe(false);
    });

    it("should match nested values using dot notation", () => {
      expect(matches(doc, { "stats.score": 100 })).toBe(true);
      expect(matches(doc, { "stats.score": 90 })).toBe(false);
    });

    it("should match nested values using objects", () => {
      expect(matches(doc, { stats: { score: 100 } })).toBe(true);
      expect(matches(doc, { stats: { score: 90 } })).toBe(false);
    });

    it("should match strings using RegExp", () => {
      expect(matches(doc, { name: /^J/ })).toBe(true);
      expect(matches(doc, { name: /ane$/ })).toBe(false);
    });
  });

  describe("numeric comparison operators", () => {
    it("should handle $gt (greater than)", () => {
      expect(matches(doc, { age: { $gt: 25 } })).toBe(true);
      expect(matches(doc, { age: { $gt: 30 } })).toBe(false);
      expect(matches(doc, { age: { $gt: 35 } })).toBe(false);
    });

    it("should handle $gte (greater than or equal)", () => {
      expect(matches(doc, { age: { $gte: 30 } })).toBe(true);
      expect(matches(doc, { age: { $gte: 35 } })).toBe(false);
    });

    it("should handle $lt (less than)", () => {
      expect(matches(doc, { age: { $lt: 35 } })).toBe(true);
      expect(matches(doc, { age: { $lt: 30 } })).toBe(false);
    });

    it("should handle $lte (less than or equal)", () => {
      expect(matches(doc, { age: { $lte: 30 } })).toBe(true);
      expect(matches(doc, { age: { $lte: 25 } })).toBe(false);
    });

    it("should handle $ne (not equal)", () => {
      expect(matches(doc, { age: { $ne: 20 } })).toBe(true);
      expect(matches(doc, { age: { $ne: 30 } })).toBe(false);
    });

    it("should handle $in", () => {
      expect(matches(doc, { age: { $in: [20, 30, 40] } })).toBe(true);
      expect(matches(doc, { age: { $in: [20, 25] } })).toBe(false);
    });

    it("should handle $nin", () => {
      expect(matches(doc, { age: { $nin: [20, 25] } })).toBe(true);
      expect(matches(doc, { age: { $nin: [30, 40] } })).toBe(false);
    });

    it("should combine multiple operators for one field", () => {
      expect(matches(doc, { age: { $gt: 20, $lt: 40 } })).toBe(true);
      expect(matches(doc, { age: { $gt: 30, $lt: 40 } })).toBe(false);
    });
  });

  describe("logical operators", () => {
    it("should handle $and", () => {
      expect(matches(doc, { $and: [{ age: 30 }, { name: "John" }] })).toBe(true);
      expect(matches(doc, { $and: [{ age: 30 }, { name: "Jane" }] })).toBe(false);
    });

    it("should handle $or", () => {
      expect(matches(doc, { $or: [{ name: "Jane" }, { age: 30 }] })).toBe(true);
      expect(matches(doc, { $or: [{ name: "Jane" }, { age: 20 }] })).toBe(false);
    });

    it("should handle $not", () => {
      expect(matches(doc, { $not: { name: "Jane" } })).toBe(true);
      expect(matches(doc, { $not: { name: "John" } })).toBe(false);
    });
  });

  describe("string operators", () => {
    it("should handle $startsWith", () => {
      expect(matches(doc, { name: { $startsWith: "Jo" } })).toBe(true);
      expect(matches(doc, { name: { $startsWith: "oh" } })).toBe(false);
    });

    it("should handle $endsWith", () => {
      expect(matches(doc, { name: { $endsWith: "hn" } })).toBe(true);
      expect(matches(doc, { name: { $endsWith: "oh" } })).toBe(false);
    });

    it("should handle $includes", () => {
      expect(matches(doc, { name: { $includes: "oh" } })).toBe(true);
      expect(matches(doc, { name: { $includes: "Jo" } })).toBe(true);
      expect(matches(doc, { name: { $includes: "Jane" } })).toBe(false);
    });

    it("should handle $regex", () => {
      expect(matches(doc, { name: { $regex: "^J" } })).toBe(true);
      expect(matches(doc, { name: { $regex: /hn$/ } })).toBe(true);
      expect(matches(doc, { name: { $regex: "a" } })).toBe(false);
    });
  });

  describe("mixing path types", () => {
    it("should work with deep object structure containing operators", () => {
      expect(
        matches(doc, {
          stats: {
            score: { $gte: 100 },
            level: { $ne: 0 },
          },
        }),
      ).toBe(true);
    });
  });

  describe("validation", () => {
    it("should throw when mixing operator keys with normal keys", () => {
      expect(() => matches(doc, { age: { $gt: 20, foo: 1 } as any })).toThrow();
    });
  });
});
