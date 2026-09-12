import { afterAll, describe, expect, it } from "vitest";
import { clearOperators, registerComparisonOperators, registerEqualityOperators } from "./index.core.js";
import finna, { compile, match, registerAllOperators, registerOperators } from "./index.js";

describe("README usage examples", () => {
  afterAll(() => {
    registerAllOperators();
  });

  it("1. Basic Pattern Matching (match & finna)", () => {
    const user = {
      name: "Alice",
      age: 28,
      tags: ["admin", "editor"],
      profile: { score: 95 },
      createdAt: new Date("2024-01-15T08:00:00Z"),
    };

    // Evaluate with match()
    const isMatch = match(user, {
      name: "Alice",
      age: { $gte: 18, $lt: 65 },
      "profile.score": { $gt: 90 },
      tags: { $some: "admin" },
    });
    expect(isMatch).toBe(true);

    // Or evaluate directly with finna()
    expect(finna(user, { name: "Alice", age: { $gte: 18 } })).toBe(true);
  });

  it("2. Compiled Predicates (compile)", () => {
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
    const isAffordableAndInStock = compile<Product>({
      price: { $lte: 100 },
      inStock: true,
    });

    // Efficiently filter arrays
    const available = inventory.filter((item) => isAffordableAndInStock(item));

    expect(available).toEqual([{ id: "3", title: "USB-C Hub", price: 35, inStock: true }]);
  });

  it("3. AST Pattern Matching Example", () => {
    interface ASTNode {
      type: string;
      name?: string;
      qualifier?: string;
      async?: boolean;
    }

    const glslUniform = {
      type: "VariableDeclaration",
      name: "u_time",
      qualifier: "uniform",
    };

    // Match AST patterns
    expect(match(glslUniform, { qualifier: "uniform", name: /^u_/ })).toBe(true);

    // Or compile an AST matcher with finna()
    const isUniform = finna<ASTNode>({ qualifier: "uniform" });
    expect(isUniform(glslUniform)).toBe(true);
    expect(isUniform({ type: "VariableDeclaration", qualifier: "attribute" })).toBe(false);
  });

  it("4. Tree-Shaking with the Core Export (/core)", () => {
    // The /core export does NOT register any operators by default.
    clearOperators();

    // Verify operator fails before registration
    expect(() => match({ score: 85 }, { score: { $gte: 80 } })).toThrow();

    // Register only the operator groups your bundle requires:
    registerEqualityOperators();
    registerComparisonOperators();

    const record = { score: 85, rank: "gold" };

    const isEligible = match(record, {
      score: { $gte: 80 },
      rank: { $eq: "gold" },
    });

    expect(isEligible).toBe(true);

    // Restore all operators for subsequent tests
    registerAllOperators();
  });

  it("5. Cross-Field References & Date Queries", () => {
    const task = {
      title: "Deliver Project",
      createdAt: new Date("2024-03-01T09:00:00Z"),
      deadline: new Date("2024-03-15T18:00:00Z"),
      metrics: { initialScore: 40, targetScore: 90 },
    };

    // 1. Cross-field comparison using $field
    const isValidDeadline = match(task, {
      deadline: { $gt: { $field: "createdAt" } },
      "metrics.targetScore": { $gt: { $field: "metrics.initialScore" } },
    });
    expect(isValidDeadline).toBe(true);

    // 2. Granular date component queries & UTC modifier
    const isMarch2024 = match(task, {
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

  it("6. Custom Operator Registration", () => {
    // Define and register a custom operator (e.g., $divisibleBy)
    const unregister = registerOperators([
      (op) => op === "$divisibleBy",
      (_op, expected) => (actual) => typeof actual === "number" && actual % expected === 0,
    ]);

    const isEven = compile({ count: { $divisibleBy: 2 } as any });
    expect(isEven({ count: 42 })).toBe(true);
    expect(isEven({ count: 43 })).toBe(false);

    // Unregister when no longer needed
    unregister();
    expect(() => compile({ count: { $divisibleBy: 2 } as any })({ count: 42 })).toThrow();
  });
});
