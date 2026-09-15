import { describe, expect, it } from "vitest";
import { createFinnaContext } from "./context.js";
import { compile, finna, match } from "./finna.js";
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

describe("match", () => {
  it("should check if a value satisfies a query pattern", () => {
    expect(match<{ name: string; age: number }>({ name: "Alice", age: 30 }, { name: "Alice", age: { $gte: 25 } })).toBe(
      true,
    );
    expect(match<{ name: string; age: number }>({ name: "Bob", age: 20 }, { name: "Alice", age: { $gte: 25 } })).toBe(
      false,
    );
  });

  it("should match nested objects and dotted fields", () => {
    const doc = {
      address: { city: "New York", zip: 10001 },
      meta: { created: 2024 },
    };
    expect(match<typeof doc>(doc, { address: { city: "New York" } })).toBe(true);
    expect(match<typeof doc>(doc, { "address.zip": 10001 })).toBe(true);
    expect(match<typeof doc>(doc, { "meta.created": { $gte: 2020 } })).toBe(true);
  });

  it("should match with predicate functions as field filters", () => {
    const order = {
      items: 3,
      unitPrice: 25,
      budget: 100,
      discount: 0.1,
    };

    // Filter receives value and root
    const satisfiesBudget = match<typeof order>(order, {
      items: (qty, root) => qty * root.unitPrice * (1 - root.discount) <= root.budget,
    });
    expect(satisfiesBudget).toBe(true);

    const overBudget = match<typeof order>(
      { ...order, items: 5 },
      {
        items: (qty, root) => qty * root.unitPrice * (1 - root.discount) <= root.budget,
      },
    );
    expect(overBudget).toBe(false);
  });

  it("should match when query pattern is a root predicate function", () => {
    const doc = { a: 10, b: 20 };
    expect(match<typeof doc>(doc, (val, root) => val.a + root.b === 30)).toBe(true);
    expect(match<typeof doc>(doc, (val, root) => val.a + root.b === 50)).toBe(false);
  });

  it("should match predicate functions inside array operators", () => {
    const doc = {
      scores: [85, 92, 78, 90],
      threshold: 80,
      minScore: 70,
      disallowed: 50,
      expectedCount: 4,
    };

    // $all with predicate
    expect(match<typeof doc>(doc, { scores: { $all: (s: number, root) => s >= root.minScore } })).toBe(true);
    expect(match<typeof doc>(doc, { scores: { $all: (s: number, root) => s >= root.threshold } })).toBe(false);

    // $some with predicate
    expect(match<typeof doc>(doc, { scores: { $some: (s: number, root) => s > root.threshold } })).toBe(true);
    expect(match<typeof doc>(doc, { scores: { $some: (s: number) => s > 100 } })).toBe(false);

    // $none with predicate
    expect(match<typeof doc>(doc, { scores: { $none: (s: number, root) => s === root.disallowed } })).toBe(true);
    expect(match<typeof doc>(doc, { scores: { $none: (s: number) => s === 92 } })).toBe(false);

    // $size with predicate
    expect(match<typeof doc>(doc, { scores: { $size: (size: number, root) => size === root.expectedCount } })).toBe(
      true,
    );
    expect(match<typeof doc>(doc, { scores: { $size: (size: number) => size > 10 } })).toBe(false);
  });

  it("should match predicate functions inside logical operators", () => {
    const doc = { count: 15, limit: 20 };

    expect(
      match<typeof doc>(doc, {
        $and: [(val, root) => val.count < root.limit, { count: { $gt: 10 } }],
      }),
    ).toBe(true);

    expect(
      match<typeof doc>(doc, {
        $or: [(val) => val.count > 50, (val, root) => val.count <= root.limit],
      }),
    ).toBe(true);

    expect(
      match<typeof doc>(doc, {
        $not: (val, root) => val.count >= root.limit,
      }),
    ).toBe(true);

    expect(
      match<typeof doc>(doc, {
        $nor: [(val, root) => val.count > root.limit, (val) => val.count < 0],
      }),
    ).toBe(true);
  });
});

describe("finna shorthand", () => {
  it("should compile when called with single pattern argument", () => {
    const isSpecial = finna({ code: "VIP" });
    expect(typeof isSpecial).toBe("function");
    expect(isSpecial({ code: "VIP" })).toBe(true);
    expect(isSpecial({ code: "REGULAR" })).toBe(false);
  });

  it("should compile with context when called with (pattern, ctx)", () => {
    const ctx = createFinnaContext(true);
    const date = new Date("2023-10-23T12:00:00Z");
    const pred = finna({ date: { $hour: 12 } }, ctx);
    expect(pred({ date })).toBe(true);
  });

  it("should match immediately when called with (value, pattern)", () => {
    expect(finna({ x: 10 }, { x: 10 })).toBe(true);
    expect(finna({ x: 10 }, { x: 20 })).toBe(false);
  });

  it("should match immediately with context when called with (value, pattern, ctx)", () => {
    const ctx = createFinnaContext(true);
    const date = new Date("2023-10-23T12:00:00Z");
    expect(finna({ date }, { date: { $hour: 12 } }, ctx)).toBe(true);
  });

  it("should work with predicate functions in finna shorthand", () => {
    // Compile mode with predicate function
    const compiled = finna((x: { a: number }) => x.a > 5);
    expect(compiled({ a: 10 })).toBe(true);
    expect(compiled({ a: 2 })).toBe(false);

    // Match mode with predicate function
    expect(finna({ a: 10, b: 5 }, (x, root) => x.a > root.b)).toBe(true);
    expect(finna({ a: 2, b: 5 }, (x, root) => x.a > root.b)).toBe(false);

    // Match mode with field predicate function
    expect(finna({ a: 10, b: 5 }, { a: (val, root) => val > root.b })).toBe(true);
  });
});
