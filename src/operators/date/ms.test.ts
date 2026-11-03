import { describe, expect, it } from "vitest";
import { createFinnaContext } from "../../context.js";
import { createMsPredicate } from "./ms.js";

describe("createMsPredicate", () => {
  const date = new Date("2023-10-23T12:30:45.500Z");
  it("extracts UTC components from dates and timestamps", () => {
    const predicate = createMsPredicate(500, createFinnaContext(true));
    expect(predicate(date)).toBe(true);
    expect(predicate(date.getTime())).toBe(true);
    expect(createMsPredicate(501, createFinnaContext(true))(date)).toBe(false);
  });
  it("extracts local components when UTC is disabled", () => {
    expect(createMsPredicate(date.getMilliseconds(), createFinnaContext(false))(date)).toBe(true);
  });
  it("passes the extracted component and root to a nested predicate", () => {
    const predicate = createMsPredicate(
      (value: number, root: { expected: number }) => value === root.expected,
      createFinnaContext(true),
    );
    expect(predicate(date, { expected: 500 })).toBe(true);
    expect(predicate(date, { expected: 501 })).toBe(false);
  });
  it.each([null, undefined, "2023-10-23", {}, new Date(NaN), NaN, Infinity])(
    "rejects invalid dates and non-date values %j",
    (actual) => {
      expect(createMsPredicate(500, createFinnaContext(true))(actual)).toBe(false);
    },
  );
});
