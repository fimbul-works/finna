import { describe, expect, it } from "vitest";
import { createQueryContext } from "../query-context.js";
import { createElementPredicate } from "./element.js";

describe("createElementPredicate", () => {
  const ctx = createQueryContext();

  describe("$exists", () => {
    it("should match when field exists", () => {
      const p = createElementPredicate("$exists", true, ctx);
      expect(p("value")).toBe(true);
      expect(p(null)).toBe(true);
      expect(p(0)).toBe(true);
      expect(p(false)).toBe(true);
      expect(p(undefined)).toBe(false);
    });

    it("should match when field does not exist", () => {
      const p = createElementPredicate("$exists", false, ctx);
      expect(p(undefined)).toBe(true);
      expect(p("value")).toBe(false);
      expect(p(null)).toBe(false);
    });
  });

  describe("$type", () => {
    it("should match string", () => {
      const p = createElementPredicate("$type", "string", ctx);
      expect(p("hello")).toBe(true);
      expect(p(123)).toBe(false);
    });

    it("should match number", () => {
      const p = createElementPredicate("$type", "number", ctx);
      expect(p(123)).toBe(true);
      expect(p("123")).toBe(false);
    });

    it("should match null", () => {
      const p = createElementPredicate("$type", "null", ctx);
      expect(p(null)).toBe(true);
      expect(p(undefined)).toBe(false);
    });

    it("should match undefined", () => {
      const p = createElementPredicate("$type", "undefined", ctx);
      expect(p(undefined)).toBe(true);
      expect(p(null)).toBe(false);
    });

    it("should match array", () => {
      const p = createElementPredicate("$type", "array", ctx);
      expect(p([])).toBe(true);
      expect(p({})).toBe(false);
    });

    it("should match object (plain)", () => {
      const p = createElementPredicate("$type", "object", ctx);
      expect(p({})).toBe(true);
      expect(p([])).toBe(false);
      expect(p(null)).toBe(false);
      expect(p(new Date())).toBe(false);
    });

    it("should match date", () => {
      const p = createElementPredicate("$type", "date", ctx);
      expect(p(new Date())).toBe(true);
      expect(p("2021-01-01")).toBe(false);
    });
  });
});
