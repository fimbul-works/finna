import { describe, expect, it } from "vitest";
import { createFinnaContext } from "../../context.js";
import { createDateOfMonthPredicate } from "./date-of-month.js";

describe("createDateOfMonthPredicate", () => {
  const date = new Date("2023-10-23T12:30:45.500Z");
  it("extracts UTC components from dates and timestamps", () => {
    const predicate = createDateOfMonthPredicate(23, createFinnaContext(true));
    expect(predicate(date)).toBe(true);
    expect(predicate(date.getTime())).toBe(true);
    expect(createDateOfMonthPredicate(24, createFinnaContext(true))(date)).toBe(false);
  });
  it("extracts local components when UTC is disabled", () => {
    expect(createDateOfMonthPredicate(date.getDate(), createFinnaContext(false))(date)).toBe(true);
  });
  it("passes the extracted component and root to a nested predicate", () => {
    const predicate = createDateOfMonthPredicate(
      (value: number, root: { expected: number }) => value === root.expected,
      createFinnaContext(true),
    );
    expect(predicate(date, { expected: 23 })).toBe(true);
    expect(predicate(date, { expected: 24 })).toBe(false);
  });
  it.each([null, undefined, "2023-10-23", {}, new Date(NaN), NaN, Infinity])(
    "rejects invalid dates and non-date values %j",
    (actual) => {
      expect(createDateOfMonthPredicate(23, createFinnaContext(true))(actual)).toBe(false);
    },
  );
});
