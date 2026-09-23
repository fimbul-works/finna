import { describe, expect, it } from "vitest";
import { compile } from "./compile.js";
import { createFinnaContext } from "./context.js";
import "./index.js";

describe("compile", () => {
  it("should compile a query into a reusable predicate function", () => {
    const isAdult = compile<{ age: number }>({ age: { $gte: 18 } });
    expect(isAdult({ age: 20 })).toBe(true);
    expect(isAdult({ age: 18 })).toBe(true);
    expect(isAdult({ age: 15 })).toBe(false);
  });

  it("should compile dotted path queries", () => {
    const p = compile<{ user: { profile: { active: boolean } } }>({ "user.profile.active": true });
    expect(p({ user: { profile: { active: true } } })).toBe(true);
    expect(p({ user: { profile: { active: false } } })).toBe(false);
    expect(p({ user: {} })).toBe(false);
  });

  it("should compile logical operators $and, $or, $not, $nor", () => {
    const andPred = compile<{ age: number; active: boolean }>({
      $and: [{ age: { $gte: 18 } }, { active: true }],
    });
    expect(andPred({ age: 20, active: true })).toBe(true);
    expect(andPred({ age: 20, active: false })).toBe(false);
    expect(andPred({ age: 16, active: true })).toBe(false);

    const orPred = compile<{ role: string }>({
      $or: [{ role: "admin" }, { role: "moderator" }],
    });
    expect(orPred({ role: "admin" })).toBe(true);
    expect(orPred({ role: "moderator" })).toBe(true);
    expect(orPred({ role: "user" })).toBe(false);

    const notPred = compile<{ banned: boolean }>({
      $not: { banned: true },
    });
    expect(notPred({ banned: false })).toBe(true);
    expect(notPred({ banned: true })).toBe(false);

    const norPred = compile<{ status: string }>({
      $nor: [{ status: "draft" }, { status: "archived" }],
    });
    expect(norPred({ status: "published" })).toBe(true);
    expect(norPred({ status: "draft" })).toBe(false);
    expect(norPred({ status: "archived" })).toBe(false);
  });

  it("should compile when pattern is a predicate function itself", () => {
    const isBigSquare = compile<{ width: number; height: number }>(
      (rect, root) => rect.width === rect.height && rect.width * root.height > 50,
    );
    expect(isBigSquare({ width: 10, height: 10 })).toBe(true);
    expect(isBigSquare({ width: 5, height: 5 })).toBe(false);
    expect(isBigSquare({ width: 10, height: 8 })).toBe(false);
  });

  it("should compile field-level predicate functions receiving value and root", () => {
    const hasEnoughBalance = compile<{ balance: number; totalCost: number }>((root) => root.balance >= root.totalCost);
    expect(hasEnoughBalance({ balance: 100, totalCost: 80 })).toBe(true);
    expect(hasEnoughBalance({ balance: 50, totalCost: 80 })).toBe(false);
  });

  it("should support custom FinnaContext", () => {
    const ctx = createFinnaContext(true);
    const date = new Date("2023-10-23T12:00:00Z");
    const p = compile<{ date: Date }>({ date: { $hour: 12 } }, ctx);
    expect(p({ date })).toBe(true);
  });
});
