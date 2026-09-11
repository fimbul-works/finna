import { describe, expect, it } from "vitest";
import "../index.js";
import { createQueryContext } from "../query-context.js";
import { createDatePredicate } from "./date.js";

describe("createDatePredicate", () => {
  const date = new Date("2023-10-23T12:30:45.500Z");

  describe("UTC context", () => {
    it("should handle UTC $year", () => {
      expect(createDatePredicate("$year", 2023, createQueryContext(true))(date)).toBe(true);
    });

    it("should handle UTC $month", () => {
      expect(createDatePredicate("$month", 9, createQueryContext(true))(date)).toBe(true);
    });

    it("should handle UTC $date", () => {
      expect(createDatePredicate("$date", 23, createQueryContext(true))(date)).toBe(true);
    });

    it("should handle UTC $weekday", () => {
      expect(createDatePredicate("$weekday", 1, createQueryContext(true))(date)).toBe(true);
    });

    it("should handle UTC $hour", () => {
      expect(createDatePredicate("$hour", 12, createQueryContext(true))(date)).toBe(true);
    });
  });

  describe("Local context", () => {
    it("should use local methods when useUtc is false", () => {
      const localYear = date.getFullYear();
      expect(createDatePredicate("$year", localYear, createQueryContext(false))(date)).toBe(true);

      const localHour = date.getHours();
      expect(createDatePredicate("$hour", localHour, createQueryContext(false))(date)).toBe(true);
    });
  });

  it("should handle $utc context switch", () => {
    // $utc operator expects an object with nested operators
    const p = createDatePredicate("$utc", { $hour: 12 }, createQueryContext(false));
    expect(p(date)).toBe(true);
  });
});
