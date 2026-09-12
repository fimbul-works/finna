# @fimbul-works/query

[![license](https://img.shields.io/npm/l/%40fimbul-works%2Fquery?color=brightgreen&style=flat-square)](LICENSE)
[![npm version](https://img.shields.io/npm/v/%40fimbul-works%2Fquery?color=blue&style=flat-square)](https://www.npmjs.com/package/@fimbul-works/query)
[![code style](https://img.shields.io/badge/code_style-biome-dfdbd6?style=flat-square)](https://biomejs.dev)
[![bundle size](https://img.shields.io/badge/bundle_size-ultra--light-blueviolet?style=flat-square)](#main-vs-core-export)

An ultra-lightweight, modular, and type-safe MongoDB-style query matching engine and predicate compiler for JavaScript and TypeScript.

---

## Installation

```bash
pnpm add @fimbul-works/query
# or
npm install @fimbul-works/query
# or
yarn add @fimbul-works/query
```

---

## Features

* **MongoDB-Style Query Syntax**: Match objects using intuitive operators, nested object structures, and dot-notation paths (`"profile.score"`).
* **Compiled Predicates**: Compile queries once with `compileQuery()` into high-performance reusable predicate functions `(value) => boolean`, or evaluate ad-hoc with `query()`.
* **Main vs `/core` Exports**:
  * `@fimbul-works/query`: Ready-to-use default export that automatically registers all built-in operator groups upon import.
  * `@fimbul-works/query/core`: Lean, tree-shakeable export that does **not** register any operator groups by default, allowing you to selectively import only the operators your project needs.
* **Equality & Comparison**: Full support for `$eq`, `$ne`, `$gt`, `$gte`, `$lt`, `$lte`, `$in`, and `$nin` across numbers, strings, and `Date` instances.
* **Logical Composition**: Combine complex query conditions with `$and`, `$or`, `$not`, and `$nor`.
* **String Operations**: Pattern and substring matching via `$regex`, `$startsWith`, `$endsWith`, and `$includes`.
* **Array Operators**: Match arrays with `$all`, `$some`, `$none`, and `$size` (exact count or nested operator queries).
* **Date Inspection & UTC**: Granular matching for date components (`$year`, `$month`, `$date`, `$weekday`, `$hour`, `$minute`, `$second`, `$ms`) with an optional `$utc` modifier.
* **Element Checking**: Inspect property existence (`$exists`) and check data types (`$type`).
* **Cross-Field References (`$field`)**: Compare a property dynamically against another property on the same root object (`{ updatedAt: { $gt: { $field: "createdAt" } } }`).
* **Extensible Operator Registry**: Plug in custom operators or operator groups using `registerOperators()`, or clear/unregister them on demand.
* **TypeScript-First**: Strict type definitions, generic query type inference (`Query<T>`), and autocomplete for operator keys.

---

## Main vs /core Export

`@fimbul-works/query` provides two primary entry points depending on bundle size and customization requirements:

| Entry Point | Pre-registered Operators | Ideal For |
| :--- | :--- | :--- |
| `@fimbul-works/query` | **All** built-in operators (`registerAllOperators()` is invoked automatically) | Standard applications wanting complete query capabilities out of the box with zero setup. |
| `@fimbul-works/query/core` | **None** (operator registry starts completely empty) | Bundle-size-critical environments and tree-shaking; register only the operator groups you actually need. |

When using `@fimbul-works/query/core`, you can selectively import and invoke individual operator group registers:
* `registerEqualityOperators()`: `$eq`, `$ne`, `$in`, `$nin`
* `registerComparisonOperators()`: `$gt`, `$gte`, `$lt`, `$lte`
* `registerElementOperators()`: `$exists`, `$type`
* `registerStringOperators()`: `$regex`, `$startsWith`, `$endsWith`, `$includes`
* `registerDateOperators()`: `$year`, `$month`, `$date`, `$weekday`, `$hour`, `$minute`, `$second`, `$ms`, `$utc`
* `registerArrayOperators()`: `$all`, `$some`, `$none`, `$size`

---

## Usage

### 1. Basic Query Matching (`query`)
```typescript
import { query } from "@fimbul-works/query";

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

console.log(isMatch); // true
```

### 2. Compiled Predicates (`compileQuery`)
```typescript
import { compileQuery } from "@fimbul-works/query";

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
// [{ id: "3", title: "USB-C Hub", price: 35, inStock: true }]
```

### 3. Tree-Shaking with the Core Export (`/core`)
```typescript
import {
  compileQuery,
  query,
  registerComparisonOperators,
  registerEqualityOperators,
} from "@fimbul-works/query/core";

// The /core export does NOT register any operators by default.
// Register only the operator groups your bundle requires:
registerEqualityOperators();
registerComparisonOperators();

const record = { score: 85, rank: "gold" };

const isEligible = query(record, {
  score: { $gte: 80 },
  rank: { $eq: "gold" },
});

console.log(isEligible); // true
```

### 4. Cross-Field References & Date Queries
```typescript
import { query } from "@fimbul-works/query";

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
```

### 5. Custom Operator Registration
```typescript
import { compileQuery, registerOperators } from "@fimbul-works/query";

// Define and register a custom operator (e.g., $divisibleBy)
const unregister = registerOperators([
  (op) => op === "$divisibleBy",
  (op, expected) => (actual) => typeof actual === "number" && actual % expected === 0,
]);

const isEven = compileQuery({ count: { $divisibleBy: 2 } as any });
console.log(isEven({ count: 42 })); // true

// Unregister when no longer needed
unregister();
```

---

## Documentation

For full type signatures and module documentation, refer to the generated [API documentation](docs/API.md).

## License

MIT License - See [LICENSE](LICENSE) file for details.

---

Built with ⚡ by [FimbulWorks](https://github.com/fimbul-works)
