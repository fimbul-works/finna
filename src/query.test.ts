import { describe, expect, it } from "vitest";
import { query } from "./index.js";

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
    createdAt: new Date("2023-05-15T10:00:00.000Z"),
    updatedAt: new Date("2023-05-15T12:00:00.000Z"),
  };

  describe("equality", () => {
    it("should match direct values", () => {
      expect(query(doc, { name: "John" })).toBe(true);
      expect(query(doc, { name: "Jane" })).toBe(false);
    });

    it("should match Date values directly", () => {
      expect(query(doc, { createdAt: new Date("2023-05-15T10:00:00.000Z") })).toBe(true);
      expect(query(doc, { createdAt: new Date("2023-05-15T11:00:00.000Z") })).toBe(false);
    });

    it("should match nested values using dot notation", () => {
      expect(query(doc, { "stats.score": 100 })).toBe(true);
      expect(query(doc, { "stats.score": 90 })).toBe(false);
    });

    it("should match nested values using objects", () => {
      expect(query(doc, { stats: { score: 100 } })).toBe(true);
      expect(query(doc, { stats: { score: 90 } })).toBe(false);
    });

    it("should match strings using RegExp", () => {
      expect(query(doc, { name: /^J/ })).toBe(true);
      expect(query(doc, { name: /ane$/ })).toBe(false);
    });
  });

  describe("numeric comparison operators", () => {
    it("should handle $gt (greater than)", () => {
      expect(query(doc, { age: { $gt: 25 } })).toBe(true);
      expect(query(doc, { age: { $gt: 30 } })).toBe(false);
      expect(query(doc, { age: { $gt: 35 } })).toBe(false);
    });

    it("should handle $gte (greater than or equal)", () => {
      expect(query(doc, { age: { $gte: 30 } })).toBe(true);
      expect(query(doc, { age: { $gte: 35 } })).toBe(false);
    });

    it("should handle $lt (less than)", () => {
      expect(query(doc, { age: { $lt: 35 } })).toBe(true);
      expect(query(doc, { age: { $lt: 30 } })).toBe(false);
    });

    it("should handle $lte (less than or equal)", () => {
      expect(query(doc, { age: { $lte: 30 } })).toBe(true);
      expect(query(doc, { age: { $lte: 25 } })).toBe(false);
    });

    it("should handle $ne (not equal)", () => {
      expect(query(doc, { age: { $ne: 20 } })).toBe(true);
      expect(query(doc, { age: { $ne: 30 } })).toBe(false);
    });

    it("should handle $in", () => {
      expect(query(doc, { age: { $in: [20, 30, 40] } })).toBe(true);
      expect(query(doc, { age: { $in: [20, 25] } })).toBe(false);
    });

    it("should handle $nin", () => {
      expect(query(doc, { age: { $nin: [20, 25] } })).toBe(true);
      expect(query(doc, { age: { $nin: [30, 40] } })).toBe(false);
    });

    it("should combine multiple operators for one field", () => {
      expect(query(doc, { age: { $gt: 20, $lt: 40 } })).toBe(true);
      expect(query(doc, { age: { $gt: 30, $lt: 40 } })).toBe(false);
    });
  });

  describe("date comparison operators", () => {
    it("should handle $eq (equal)", () => {
      expect(query(doc, { createdAt: { $eq: new Date("2023-05-15T10:00:00.000Z") } })).toBe(true);
      expect(query(doc, { createdAt: { $eq: new Date("2023-05-15T11:00:00.000Z") } })).toBe(false);
    });

    it("should handle $ne (not equal)", () => {
      expect(query(doc, { createdAt: { $ne: new Date("2023-05-15T11:00:00.000Z") } })).toBe(true);
      expect(query(doc, { createdAt: { $ne: new Date("2023-05-15T10:00:00.000Z") } })).toBe(false);
    });

    it("should handle $gt (greater than)", () => {
      expect(query(doc, { createdAt: { $gt: new Date("2023-05-15T09:00:00.000Z") } })).toBe(true);
      expect(query(doc, { createdAt: { $gt: new Date("2023-05-15T10:00:00.000Z") } })).toBe(false);
      expect(query(doc, { createdAt: { $gt: new Date("2023-05-15T11:00:00.000Z") } })).toBe(false);
    });

    it("should handle $gte (greater than or equal)", () => {
      expect(query(doc, { createdAt: { $gte: new Date("2023-05-15T10:00:00.000Z") } })).toBe(true);
      expect(query(doc, { createdAt: { $gte: new Date("2023-05-15T09:00:00.000Z") } })).toBe(true);
      expect(query(doc, { createdAt: { $gte: new Date("2023-05-15T11:00:00.000Z") } })).toBe(false);
    });

    it("should handle $lt (less than)", () => {
      expect(query(doc, { createdAt: { $lt: new Date("2023-05-15T11:00:00.000Z") } })).toBe(true);
      expect(query(doc, { createdAt: { $lt: new Date("2023-05-15T10:00:00.000Z") } })).toBe(false);
      expect(query(doc, { createdAt: { $lt: new Date("2023-05-15T09:00:00.000Z") } })).toBe(false);
    });

    it("should handle $lte (less than or equal)", () => {
      expect(query(doc, { createdAt: { $lte: new Date("2023-05-15T10:00:00.000Z") } })).toBe(true);
      expect(query(doc, { createdAt: { $lte: new Date("2023-05-15T11:00:00.000Z") } })).toBe(true);
      expect(query(doc, { createdAt: { $lte: new Date("2023-05-15T09:00:00.000Z") } })).toBe(false);
    });

    it("should handle $in", () => {
      expect(
        query(doc, {
          createdAt: {
            $in: [new Date("2023-05-15T09:00:00.000Z"), new Date("2023-05-15T10:00:00.000Z")],
          },
        }),
      ).toBe(true);
      expect(
        query(doc, {
          createdAt: {
            $in: [new Date("2023-05-15T08:00:00.000Z"), new Date("2023-05-15T09:00:00.000Z")],
          },
        }),
      ).toBe(false);
    });

    it("should handle $nin", () => {
      expect(
        query(doc, {
          createdAt: {
            $nin: [new Date("2023-05-15T08:00:00.000Z"), new Date("2023-05-15T09:00:00.000Z")],
          },
        }),
      ).toBe(true);
      expect(
        query(doc, {
          createdAt: {
            $nin: [new Date("2023-05-15T09:00:00.000Z"), new Date("2023-05-15T10:00:00.000Z")],
          },
        }),
      ).toBe(false);
    });

    it("should combine multiple date operators for range query", () => {
      expect(
        query(doc, {
          createdAt: {
            $gte: new Date("2023-05-15T09:00:00.000Z"),
            $lte: new Date("2023-05-15T11:00:00.000Z"),
          },
        }),
      ).toBe(true);
      expect(
        query(doc, {
          createdAt: {
            $gt: new Date("2023-05-15T10:00:00.000Z"),
            $lt: new Date("2023-05-15T11:00:00.000Z"),
          },
        }),
      ).toBe(false);
    });

    it("should compare dates with $field references", () => {
      expect(query(doc, { updatedAt: { $gt: { $field: "createdAt" } } })).toBe(true);
      expect(query(doc, { createdAt: { $gt: { $field: "updatedAt" } } })).toBe(false);
      expect(query(doc, { createdAt: { $eq: { $field: "createdAt" } } })).toBe(true);
      expect(query(doc, { createdAt: { $ne: { $field: "updatedAt" } } })).toBe(true);
    });
  });

  describe("logical operators", () => {
    it("should handle $and", () => {
      expect(query(doc, { $and: [{ age: 30 }, { name: "John" }] })).toBe(true);
      expect(query(doc, { $and: [{ age: 30 }, { name: "Jane" }] })).toBe(false);
    });

    it("should handle $or", () => {
      expect(query(doc, { $or: [{ name: "Jane" }, { age: 30 }] })).toBe(true);
      expect(query(doc, { $or: [{ name: "Jane" }, { age: 20 }] })).toBe(false);
    });

    it("should handle $not", () => {
      expect(query(doc, { $not: { name: "Jane" } })).toBe(true);
      expect(query(doc, { $not: { name: "John" } })).toBe(false);
    });
  });

  describe("string operators", () => {
    it("should handle $startsWith", () => {
      expect(query(doc, { name: { $startsWith: "Jo" } })).toBe(true);
      expect(query(doc, { name: { $startsWith: "oh" } })).toBe(false);
    });

    it("should handle $endsWith", () => {
      expect(query(doc, { name: { $endsWith: "hn" } })).toBe(true);
      expect(query(doc, { name: { $endsWith: "oh" } })).toBe(false);
    });

    it("should handle $includes", () => {
      expect(query(doc, { name: { $includes: "oh" } })).toBe(true);
      expect(query(doc, { name: { $includes: "Jo" } })).toBe(true);
      expect(query(doc, { name: { $includes: "Jane" } })).toBe(false);
    });

    it("should handle $regex", () => {
      expect(query(doc, { name: { $regex: "^J" } })).toBe(true);
      expect(query(doc, { name: { $regex: /hn$/ } })).toBe(true);
      expect(query(doc, { name: { $regex: "a" } })).toBe(false);
    });
  });

  describe("mixing path types", () => {
    it("should work with deep object structure containing operators", () => {
      expect(
        query(doc, {
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
      expect(() => query(doc, { age: { $gt: 20, foo: 1 } as any })).toThrow();
    });
  });
});
