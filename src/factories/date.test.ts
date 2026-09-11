import { describe, expect, it } from "vitest";
import { createDatePredicate } from "./date.js";

describe("createDatePredicate", () => {
  const date = new Date("2023-10-23T12:30:45.500Z");

  describe("UTC context", () => {
    it("should handle UTC $year", () => {
      expect(createDatePredicate("$year", 2023, true)(date)).toBe(true);
    });

    it("should handle UTC $month", () => {
      expect(createDatePredicate("$month", 9, true)(date)).toBe(true);
    });

    it("should handle UTC $date", () => {
      expect(createDatePredicate("$date", 23, true)(date)).toBe(true);
    });

    it("should handle UTC $weekday", () => {
      expect(createDatePredicate("$weekday", 1, true)(date)).toBe(true);
    });

    it("should handle UTC $hour", () => {
      expect(createDatePredicate("$hour", 12, true)(date)).toBe(true);
    });
  });

  describe("Local context", () => {
    it("should use local methods when useUtc is false", () => {
      const localYear = date.getFullYear();
      expect(createDatePredicate("$year", localYear, false)(date)).toBe(true);

      const localHour = date.getHours();
      expect(createDatePredicate("$hour", localHour, false)(date)).toBe(true);
    });
  });

  it("should handle $utc context switch", () => {
    // $utc operator expects an object with nested operators
    const p = createDatePredicate("$utc", { $hour: 12 });
    expect(p(date)).toBe(true);
  });
});
