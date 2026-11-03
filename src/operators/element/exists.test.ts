import { describe, expect, it } from "vitest";
import { createFinnaContext } from "../../context.js";
import { createExistsPredicate } from "./exists.js";

describe("createExistsPredicate", () => {
  it.each(["value", null, 0, false, [], {}])("recognizes defined values %j", (actual) => {
    expect(createExistsPredicate(true, createFinnaContext())(actual)).toBe(true);
    expect(createExistsPredicate(false, createFinnaContext())(actual)).toBe(false);
  });
  it("recognizes undefined as absent", () => {
    expect(createExistsPredicate(true, createFinnaContext())(undefined)).toBe(false);
    expect(createExistsPredicate(false, createFinnaContext())(undefined)).toBe(true);
  });
});
