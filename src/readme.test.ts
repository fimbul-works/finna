import { afterAll, describe, expect, it } from "vitest";
import { clearOperators, registerComparisonOperators, registerEqualityOperators } from "./index.core.js";
import { compileQuery, query, registerAllOperators, registerOperators } from "./index.js";

describe("README usage examples", () => {
  afterAll(() => {
    registerAllOperators();
  });

  it("1. Basic Query Matching (query)", () => {
    const user = {
      name: "Alice",
      age: 28,
      tags: ["admin", "editor"],
      profile: { score: 95 },
      createdAt: new Date("2024-01-15T08:00:00Z"),
    };

    // Evaluate a query with equality, comparison, nested paths, and arrays
    const isMatch = query(user, {
      name: "Alice",
      age: { $gte: 18, $lt: 65 },
      "profile.score": { $gt: 90 },
      tags: { $some: "admin" },
    });

    expect(isMatch).toBe(true);
  });

  it("2. Compiled Predicates (compileQuery)", () => {
    interface Product {
      id: string;
      title: string;
      price: number;
      inStock: boolean;
    }

    const inventory: Product[] = [
      { id: "1", title: "Mechanical Keyboard", price: 120, inStock: true },
      { id: "2", title: "Gaming Mouse", price: 60, inStock: false },
      { id: "3", title: "USB-C Hub", price: 35, inStock: true },
    ];

    // Compile once into a reusable predicate function
    const isAffordableAndInStock = compileQuery<Product>({
      price: { $lte: 100 },
      inStock: true,
    });

    // Efficiently filter arrays
    const available = inventory.filter((item) => isAffordableAndInStock(item));

    expect(available).toEqual([{ id: "3", title: "USB-C Hub", price: 35, inStock: true }]);
  });

  it("3. Tree-Shaking with the Core Export (/core)", () => {
    // The /core export does NOT register any operators by default.
    clearOperators();

    // Verify operator fails before registration
    expect(() => query({ score: 85 }, { score: { $gte: 80 } })).toThrow();

    // Register only the operator groups your bundle requires:
    registerEqualityOperators();
    registerComparisonOperators();

    const record = { score: 85, rank: "gold" };

    const isEligible = query(record, {
      score: { $gte: 80 },
      rank: { $eq: "gold" },
    });

    expect(isEligible).toBe(true);

    // Restore all operators for subsequent tests
    registerAllOperators();
  });

  it("4. Cross-Field References & Date Queries", () => {
    const task = {
      title: "Deliver Project",
      createdAt: new Date("2024-03-01T09:00:00Z"),
      deadline: new Date("2024-03-15T18:00:00Z"),
      metrics: { initialScore: 40, targetScore: 90 },
    };

    // 1. Cross-field comparison using $field
    const isValidDeadline = query(task, {
      deadline: { $gt: { $field: "createdAt" } },
      "metrics.targetScore": { $gt: { $field: "metrics.initialScore" } },
    });
    expect(isValidDeadline).toBe(true);

    // 2. Granular date component queries & UTC modifier
    const isMarch2024 = query(task, {
      createdAt: {
        $utc: {
          $year: 2024,
          $month: 2, // 0-indexed month (2 = March)
          $date: { $lte: 15 },
        },
      },
    });
    expect(isMarch2024).toBe(true);
  });

  it("5. Custom Operator Registration", () => {
    // Define and register a custom operator (e.g., $divisibleBy)
    const unregister = registerOperators([
      (op) => op === "$divisibleBy",
      (_op, expected) => (actual) => typeof actual === "number" && actual % expected === 0,
    ]);

    const isEven = compileQuery({ count: { $divisibleBy: 2 } as any });
    expect(isEven({ count: 42 })).toBe(true);
    expect(isEven({ count: 43 })).toBe(false);

    // Unregister when no longer needed
    unregister();
    expect(() => compileQuery({ count: { $divisibleBy: 2 } as any })({ count: 42 })).toThrow();
  });
});
