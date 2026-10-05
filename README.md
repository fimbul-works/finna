![@fimbul-works/finna](./finna-logo.svg)

[![license](https://img.shields.io/npm/l/%40fimbul-works%2Ffinna?color=brightgreen&style=flat-square)](LICENSE)
[![npm version](https://img.shields.io/npm/v/%40fimbul-works%2Ffinna?color=blue&style=flat-square)](https://www.npmjs.com/package/@fimbul-works/finna)
[![code style](https://img.shields.io/badge/code_style-biome-dfdbd6?style=flat-square)](https://biomejs.dev)
[![bundle size](https://img.shields.io/badge/bundle_size-ultra--light-blueviolet?style=flat-square)](#main-vs-core-export)

An ultra-lightweight, modular, and type-safe pattern matching engine and predicate compiler for JavaScript and TypeScript. Built for document indexing, compiler AST traversal, and reactive pipelines.

> **Etymology:** Named after Old Norse *finna* for "to find, discover, encounter".

---

## Installation

```bash
pnpm add @fimbul-works/finna
# or
npm install @fimbul-works/finna
# or
yarn add @fimbul-works/finna
```

---

## Highlights

* **Universal Pattern Syntax**: Match objects using intuitive declarative operators, deep structures, and dot-notation paths (`"stats.score"`).
* **Compiled Predicates**: Compile patterns once with `compile()` into high-performance reusable predicate functions `(value) => boolean`, or evaluate ad-hoc with `match(value, pattern)`.
* **Equality & Comparison**: Full support for `$eq`, `$ne`, `$gt`, `$gte`, `$lt`, `$lte`, `$in`, and `$nin` across numbers, strings, and `Date` instances.
* **Logical Composition**: Combine complex conditions with `$and`, `$or`, `$not`, and `$nor`.
* **String Operations**: Pattern and substring matching via `$regex`, `$startsWith`, `$endsWith`, and `$includes`.
* **Array Operators**: Match arrays with `$all`, `$some`, `$none`, and `$size` (exact count or nested operator queries).
* **Date Inspection & UTC**: Granular matching for date components (`$year`, `$month`, `$date`, `$weekday`, `$hour`, `$minute`, `$second`, `$ms`) with an optional `$utc` modifier.
* **Element Checking**: Inspect property existence (`$exists`) and check data types (`$type`).
* **Cross-Field References (`$field`)**: Compare a property dynamically against another property on the same root object (`{ updatedAt: { $gt: { $field: "createdAt" } } }`).
* **Predicate Functions as Filters**: Use custom predicate functions `(value, root) => boolean` directly as filters on fields or top-level patterns, receiving both the target value and the root document.
* **Extensible Operator Registry**: Plug in custom operators or operator groups using `registerOperators()`, or clear/unregister them on demand.
* **TypeScript-First**: Strict type definitions, generic pattern type inference (`Query<T>`), and autocomplete for operator keys.

---

## Main vs /core Export

`@fimbul-works/finna` provides two primary entry points depending on bundle size and customization requirements:

| Entry Point | Pre-registered Operators | Ideal For |
| :--- | :--- | :--- |
| `@fimbul-works/finna` | **All** built-in operators (`registerAllOperators()` is invoked automatically) | Standard applications wanting complete pattern matching capabilities out of the box with zero setup. |
| `@fimbul-works/finna/core` | **None** (operator registry starts completely empty) | Bundle-size-critical environments and tree-shaking; register only the operator groups you actually need. |

When using `@fimbul-works/finna/core`, you can selectively import and invoke individual operator group registers:
* `registerEqualityOperators()`: `$eq`, `$ne`, `$in`, `$nin`
* `registerComparisonOperators()`: `$gt`, `$gte`, `$lt`, `$lte`
* `registerElementOperators()`: `$exists`, `$type`
* `registerStringOperators()`: `$regex`, `$startsWith`, `$endsWith`, `$includes`
* `registerDateOperators()`: `$year`, `$month`, `$date`, `$weekday`, `$hour`, `$minute`, `$second`, `$ms`, `$utc`
* `registerArrayOperators()`: `$all`, `$some`, `$none`, `$size`

---

## Usage

### 1. One-Shot Pattern Matching (`match`)

```typescript
import { match } from "@fimbul-works/finna";

const user = {
  name: "Alice",
  age: 28,
  tags: ["admin", "editor"],
  profile: { score: 95 },
  createdAt: new Date("2024-01-15T08:00:00Z"),
};

// Evaluate a pattern with equality, comparison, nested paths, and arrays
const isMatch = match(user, {
  name: "Alice",
  age: { $gte: 18, $lt: 65 },
  "profile.score": { $gt: 90 },
  tags: { $some: "admin" },
});

console.log(isMatch); // true
```

### 2. Compiled Predicates (`compile`)

Compile once into an optimized, reusable predicate function:

```typescript
import { compile } from "@fimbul-works/finna";

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

// Efficiently filter collections
const available = inventory.filter(isAffordableAndInStock);
// [{ id: "3", title: "USB-C Hub", price: 35, inStock: true }]
```

### 3. Tree-Shaking with the Core Export (`/core`)

```typescript
import {
  compile,
  match,
  registerComparisonOperators,
  registerEqualityOperators,
} from "@fimbul-works/finna/core";

// The /core export does NOT register any operators by default.
// Register only the operator groups your bundle requires:
registerEqualityOperators();
registerComparisonOperators();

const record = { score: 85, rank: "gold" };

const isEligible = match(record, {
  score: { $gte: 80 },
  rank: { $eq: "gold" },
});

console.log(isEligible); // true
```

### 4. Cross-Field References & Date Queries

```typescript
import { match } from "@fimbul-works/finna";

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
```

### 5. Predicate Functions as Filters

A filter can also be a predicate function itself, receiving the target value as the 1st parameter and the root value as the 2nd parameter:

```typescript
import { compile, match } from "@fimbul-works/finna";

const order = {
  items: 3,
  unitPrice: 25,
  budget: 100,
  tags: ["priority", "express"],
};

// 1. Field-level predicate receiving (value, root)
const withinBudget = match(order, {
  items: (qty, root) => qty * root.unitPrice <= root.budget,
});
console.log(withinBudget); // true

// 2. Predicates inside array operators
const hasShortTag = match(order, {
  tags: { $some: (tag) => tag.length < 8 },
});
console.log(hasShortTag); // true

// 3. Root-level predicate function
const isQualifying = compile<typeof order>(
  (val, root) => val.items * root.unitPrice > 50,
);
console.log(isQualifying(order)); // true
```

### 6. Custom Operator Registration

```typescript
import { compile, registerOperators } from "@fimbul-works/finna";

// Define and register a custom operator (e.g., $divisibleBy)
const unregister = registerOperators([
  (op) => op === "$divisibleBy",
  (op, expected) => (actual) => typeof actual === "number" && actual % expected === 0,
]);

const isEven = compile({ count: { $divisibleBy: 2 }});
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
