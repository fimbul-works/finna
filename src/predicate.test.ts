import { describe, expect, it } from "vitest";
import { createPredicate } from "./index.js";

describe("createPredicate (Integration)", () => {
  describe("recursive matching", () => {
    it("should handle deep object matching", () => {
      const p = createPredicate({ a: { b: { c: 1 } } });
      expect(p({ a: { b: { c: 1, d: 2 } } })).toBe(true);
      expect(p({ a: { b: { c: 2 } } })).toBe(false);
    });

    it("should handle mixed literal and operators", () => {
      const p = createPredicate({
        age: { $gt: 20 },
        name: "John",
      });
      expect(p({ age: 25, name: "John" })).toBe(true);
      expect(p({ age: 15, name: "John" })).toBe(false);
    });
  });

  describe("context modification: $utc", () => {
    const date = new Date("2023-10-23T12:30:00Z");

    it("should switch context for all nested date operators", () => {
      const p = createPredicate({
        $utc: {
          $hour: 12,
          $year: { $gt: 2020 },
        },
      });
      expect(p(date)).toBe(true);
    });

    it("should support deeply nested $utc", () => {
      const p = createPredicate({
        profile: {
          createdAt: {
            $utc: { $hour: 12 },
          },
        },
      });
      expect(p({ profile: { createdAt: date } })).toBe(true);
    });
  });

  describe("complex array + recursion", () => {
    it("should handle array elements matching size queries", () => {
      const p = createPredicate({
        tags: { $size: { $gte: 2 } },
      });
      expect(p({ tags: [1, 2] })).toBe(true);
      expect(p({ tags: [1] })).toBe(false);
    });
  });
});
