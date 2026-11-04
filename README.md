# ![@fimbul-works/finna](./finna-logo.svg)

[![license](https://img.shields.io/npm/l/%40fimbul-works%2Ffinna?color=brightgreen&style=flat-square)](LICENSE)
[![npm version](https://img.shields.io/npm/v/%40fimbul-works%2Ffinna?color=blue&style=flat-square)](https://www.npmjs.com/package/@fimbul-works/finna)
[![code style](https://img.shields.io/badge/code_style-biome-dfdbd6?style=flat-square)](https://biomejs.dev)
[![bundle size](https://img.shields.io/badge/bundle_size-ultra--light-blueviolet?style=flat-square)](#main-vs-core-export)

An ultra-lightweight, modular, and type-safe pattern matching engine and predicate compiler for JavaScript and TypeScript. Built for document indexing, compiler AST traversal, and reactive pipelines.

> **Etymology:** Named after Old Norse _finna_ for "to find, discover, encounter".

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

- **Universal Pattern Syntax**: Match objects using intuitive declarative operators, deep structures, and dot-notation paths (`"stats.score"`).
- **Compiled Predicates**: Compile patterns once with `compile()` into high-performance reusable predicate functions `(value) => boolean`, or evaluate ad-hoc with `match(value, pattern)`.
- **Equality & Comparison**: Full support for `$eq`, `$ne`, `$gt`, `$gte`, `$lt`, `$lte`, `$in`, and `$nin` across numbers, strings, and `Date` instances.
- **Logical Composition**: Combine complex conditions with `$and`, `$or`, `$not`, and `$nor`.
- **String Operations**: Pattern and substring matching via `$regex`, `$startsWith`, `$endsWith`, and `$includes`.
- **Array Operators**: Match arrays with `$all`, `$some`, `$none`, and `$size` (exact count or nested operator queries).
- **Date Inspection & UTC**: Granular matching for date components (`$year`, `$month`, `$date`, `$weekday`, `$hour`, `$minute`, `$second`, `$ms`) with an optional `$utc` modifier.
- **Element Checking**: Inspect property existence (`$exists`) and check data types (`$type`).
- **Cross-Field References (`$field`)**: Compare a property dynamically against another property on the same root object (`{ updatedAt: { $gt: { $field: "createdAt" } } }`).
- **Predicate Functions as Filters**: Use custom predicate functions `(value, root) => boolean` directly as filters on fields or top-level patterns, receiving both the target value and the root document.
- **Extensible Operator Registry**: Plug in custom operators or operator groups using `registerOperators()`, or clear/unregister them on demand.
- **TypeScript-First**: Strict type definitions, generic pattern type inference (`Query<T>`), and autocomplete for operator keys.

---

## Main vs /core Export

Both `@fimbul-works/finna` and `@fimbul-works/finna/core` expose the same API and start with an empty operator registry. Imports have no registration side effects. Register operators once in your application setup:

```typescript
import { registerAllOperators } from "@fimbul-works/finna";
registerAllOperators();
```

For finer control, register individual factories or category presets:

```typescript
import {
  registerOperator,
  createGtPredicate,
  registerEqualityOperators,
  hasOperator,
  getOperator,
  listOperators,
} from "@fimbul-works/finna";

registerOperator("$gt", createGtPredicate);
registerEqualityOperators();
hasOperator("$gt"); // true
getOperator("$gt"); // createGtPredicate
for (const [name, factory] of listOperators()) {
  console.log(name, factory);
}
```

Each built-in filter operator has its own implementation module and exported factory, organized by category under `src/array/`, `src/comparison/`, `src/date/`, `src/element/`, `src/equality/`, and `src/string/`. Each category has an `index.ts` for its registration helper. Factory names follow `createGtPredicate`, `createStartsWithPredicate`, etc.; `$date` uses `createDateOfMonthPredicate`. Category helpers remain available:

- `registerEqualityOperators()`: `$eq`, `$ne`, `$in`, `$nin`
- `registerComparisonOperators()`: `$gt`, `$gte`, `$lt`, `$lte`
- `registerElementOperators()`: `$exists`, `$type`, `$truthy`, `$falsy`, `$nullish`, and the `$is…` type checks
- `registerStringOperators()`: `$regex`, `$startsWith`, `$endsWith`, `$includes`, `$uppercase`, `$lowercase`, `$replace`, `$replaceAll`
- `registerDateOperators()`: `$year`, `$month`, `$date`, `$weekday`, `$hour`, `$minute`, `$second`, `$ms`, `$utc`
- `registerArrayOperators()`: `$all`, `$some`, `$none`, `$size`

The registry lists configurable **filter operators**. Logical query composition (`$and`, `$or`, `$not`, `$nor`), literal matching, predicate functions, and `$field` value references remain core syntax and do not require registration.

Importing Finna leaves the registry empty. Call `registerAllOperators()` for all built-ins, a category helper for a subset, or `registerOperator()` for an individual factory.

Element operators include `$truthy`, `$falsy`, and `$nullish` (their arguments are ignored), plus `$isNumber`, `$isString`, `$isInteger`, `$isObject`, `$isArray`, `$isDate`, and `$isSymbol`. The `$is…` checks take a boolean: `true` checks the type and `false` checks its inverse. `$isClass` takes a constructor, for example `{ value: { $isClass: MyClass } }`.

These checks use Hvat semantics: numbers include `NaN` and infinities; objects exclude null and arrays but include class instances; dates are Date instances, including invalid dates. `$type` accepts all JavaScript `typeof` names plus `array`, `date`, `null`, and `int`; its `object` check additionally excludes Date instances. Unsupported type names produce compilation errors. `$isTimestamp` is deferred until its representation is defined.

---

## Usage

### 1. One-Shot Pattern Matching (`match`)

```typescript
import { match, registerAllOperators } from "@fimbul-works/finna";

registerAllOperators();

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
import { compile, registerComparisonOperators } from "@fimbul-works/finna";

registerComparisonOperators();

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
import { compile, match, registerComparisonOperators, registerEqualityOperators } from "@fimbul-works/finna/core";

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
import { match, registerAllOperators } from "@fimbul-works/finna";

registerAllOperators();

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
import { compile, match, registerArrayOperators } from "@fimbul-works/finna";

registerArrayOperators();

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
const isQualifying = compile<typeof order>((val, root) => val.items * root.unitPrice > 50);
console.log(isQualifying(order)); // true
```

### String transformations

`$uppercase` and `$lowercase` transform a string and apply a nested filter. `$replace` and `$replaceAll` take `{ search, replace, then }`, where `then` tests the replaced string. These operations leave the document unchanged. Nest transformations to specify their order; sibling operators each receive the original field value.

```typescript
import { compile, registerAllOperators } from "@fimbul-works/finna";

registerAllOperators();

const matchesSlug = compile({
  title: {
    $lowercase: {
      $replaceAll: {
        search: /\s+/g,
        replace: "-",
        then: { $eq: { $field: "expectedSlug" } },
      },
    },
  },
});

matchesSlug({ title: "Hello World", expectedSlug: "hello-world" }); // true

const matchesReplacement = compile({
  message: {
    $replaceAll: {
      search: { $field: "rules.search" },
      replace: { $field: "rules.replacement" },
      then: { $eq: { $field: "expectedMessage" } },
    },
  },
});

matchesReplacement({
  message: "Hi NAME, welcome NAME",
  rules: { search: "NAME", replacement: "Alice" },
  expectedMessage: "Hi Alice, welcome Alice",
}); // true
```

Searches accept literal strings, RegExp instances, or `$field` references to either. Replacement text accepts a string or `$field` reference. All references resolve against the original root document on every evaluation, including inside nested transformations.

`$replace` follows JavaScript `String.replace`: a string search replaces its first occurrence, and regex flags determine regex matching. `$replaceAll` replaces every string occurrence and requires `g` on regex searches. String searches are literal. Replacement strings use JavaScript substitution syntax, including `$$`, `$&`, and regex captures such as `$1`. Regex matching starts at index zero on each evaluation and leaves the supplied regex's `lastIndex` unchanged.

Non-string inputs and invalid referenced arguments return `false`. Invalid literal replacement arguments, a missing `then`, or a literal regex without `g` for `$replaceAll` produce compilation errors. Transformations keep intermediate strings local to each evaluation; they do not store temporary values in `FinnaContext`.

### 6. Custom Operator Registration

```typescript
import { compile, registerOperator, type FilterPredicate } from "@fimbul-works/finna";

// Define and register a custom operator (e.g., $divisibleBy)
const unregister = registerOperator(
  "$divisibleBy",
  (expected: number) => ((actual: any) => typeof actual === "number" && actual % expected === 0) as FilterPredicate,
);

const isEven = compile({ count: { $divisibleBy: 2 } });
console.log(isEven({ count: 42 })); // true

// Unregister when no longer needed
unregister();
```

---

## Registration and compilation errors

`operatorMap` is a read-only view of installed names and factories; `listOperators()` returns an independent Map snapshot. Use `registerOperator(name, factory)` or `registerOperators(iterableOfEntries)` to install factories. Operator maps use `Map<OperatorName, OperatorFactory>`, where `OperatorName` is the template literal type `` `$${string}` ``. Registration and lookup APIs require dollar-prefixed names at compile time; registration also validates names at runtime. Registration batches are atomic. Re-registering the same factory is a no-op; a different factory requires `{ replace: true }`. Registration returns an idempotent cleanup function that only removes entries installed by that call, and never removes a later replacement. Replacement cleanup removes the replacement without restoring its predecessor. Use `unregisterOperator(name)` or `clearOperators()` for explicit removal. Already compiled predicates retain their factories' compiled behavior.

`compile()`, `createPredicate()`, and `match()` throw an `AggregateError` for invalid queries, including unregistered operators and invalid `$in`/`$nin` arguments. Nested filters compile eagerly, so errors are reported before data is tested, including inside array and logical branches.

```typescript
import { compile, createFinnaContext, registerEqualityOperators } from "@fimbul-works/finna";

registerEqualityOperators();
const ctx = createFinnaContext(true); // UTC date operations
try {
  compile({ age: { $in: 42 }, role: { $nin: "admin" } }, ctx);
} catch (error) {
  if (!(error instanceof AggregateError)) throw error;
  for (const diagnostic of error.errors) {
    console.error(diagnostic.path, diagnostic.message, diagnostic.cause);
  }
}
```

`FinnaContext.errors` stores Error objects. Each compilation reports only errors added during that call, so a context can be reused after a failed compilation. Runtime type mismatches return `false` without recording diagnostics. Exceptions from user predicate functions propagate during evaluation.

### Migrating from v1

- Call a registration helper in application setup; importing the main entry point no longer installs operators.
- Replace matcher/factory tuples with named factories: `registerOperator("$custom", (expected, ctx) => predicate)`.
- Replace `operatorGroups` with registry inspection APIs and `unregisterOperators(tuple)` with `unregisterOperator(name)`.
- Replace `ctx.warnings` with `ctx.errors`, and catch `AggregateError` at compilation boundaries. Nested query errors now surface during compilation.
- Both main and `/core` imports support tree-shaking and explicit registration.

## Documentation

For full type signatures and module documentation, refer to the generated [API documentation](docs/API.md).

## License

MIT License - See [LICENSE](LICENSE) file for details.

---

Built with ⚡ by [FimbulWorks](https://github.com/fimbul-works)
