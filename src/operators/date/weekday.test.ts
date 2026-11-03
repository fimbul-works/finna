import { describe, expect, it } from "vitest";
import { createFinnaContext } from "../../context.js";
import { createWeekdayPredicate } from "./weekday.js";

describe("createWeekdayPredicate", () => {
  const date = new Date("2023-10-23T12:30:45.500Z");
  it("extracts UTC components from dates and timestamps", () => {
    const predicate = createWeekdayPredicate(1, createFinnaContext(true));
    expect(predicate(date)).toBe(true);
    expect(predicate(date.getTime())).toBe(true);
    expect(createWeekdayPredicate(2, createFinnaContext(true))(date)).toBe(false);
  });
  it("extracts local components when UTC is disabled", () => {
    expect(createWeekdayPredicate(date.getDay(), createFinnaContext(false))(date)).toBe(true);
  });
  it("passes the extracted component and root to a nested predicate", () => {
    const predicate = createWeekdayPredicate(
      (value: number, root: { expected: number }) => value === root.expected,
      createFinnaContext(true),
    );
    expect(predicate(date, { expected: 1 })).toBe(true);
    expect(predicate(date, { expected: 2 })).toBe(false);
  });
  it.each([null, undefined, "2023-10-23", {}, new Date(NaN), NaN, Infinity])(
    "rejects invalid dates and non-date values %j",
    (actual) => {
      expect(createWeekdayPredicate(1, createFinnaContext(true))(actual)).toBe(false);
    },
  );
});
