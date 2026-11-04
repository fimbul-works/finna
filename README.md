# ![@fimbul-works/finna](./finna-logo.svg)

[![license](https://img.shields.io/npm/l/%40fimbul-works%2Ffinna?color=brightgreen&style=flat-square)](LICENSE)
[![npm version](https://img.shields.io/npm/v/%40fimbul-works%2Ffinna?color=blue&style=flat-square)](https://www.npmjs.com/package/@fimbul-works/finna)
[![code style](https://img.shields.io/badge/code_style-biome-dfdbd6?style=flat-square)](https://biomejs.dev)
[![bundle size](https://img.shields.io/badge/bundle_size-ultra--light-blueviolet?style=flat-square)](#comparing-bundle-sizes)

An ultra-lightweight, modular, and type-safe pattern matching engine and predicate compiler for JavaScript and TypeScript. Built for document indexing, validation systems, AST traversal, and reactive pipelines.

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
- **String Operations**: Pattern and substring matching, case conversion, and replacement with nested result predicates.
- **Array Operators**: Match arrays with `$all`, `$some`, `$none`, and `$size` (exact count or nested operator queries).
- **Date Inspection & UTC**: Granular matching for date components (`$year`, `$month`, `$date`, `$weekday`, `$hour`, `$minute`, `$second`, `$ms`) with an optional `$utc` modifier.
- **Element Checking**: Inspect definedness (`$exists`), types (`$type`, `$is…`), truthiness, falsiness, and nullishness.
- **Cross-Field References (`$field`)**: Compare a property dynamically against another property on the same root object (`{ updatedAt: { $gt: { $field: "createdAt" } } }`).
- **Predicate Functions as Filters**: Use custom predicate functions `(value, root) => boolean` directly as filters on fields or top-level patterns, receiving both the target value and the root document.
- **Extensible Operator Registry**: Plug in custom operators or operator groups using `registerOperators()`, or clear/unregister them on demand.
- **TypeScript-First**: Strict type definitions, generic pattern type inference (`Query<T>`), and autocomplete for operator keys.

---

## Choosing operators

`@fimbul-works/finna` exports the complete API and leaves the operator registry empty. Register the groups or individual factories your application needs. The former `/core` package export has been removed; use the main entry point or direct operator imports.

Start with the basic preset:

<!-- example: ast-core -->
```typescript
import { compile, registerCoreOperators } from "@fimbul-works/finna";

registerCoreOperators();
const followsStart = compile({ end: { $gt: { $field: "start" } } });
console.log(followsStart({ start: 5, end: 10 })); // true
```

Application using every feature:

<!-- example: all-operators -->
```typescript
import { compile, registerAllOperators } from "@fimbul-works/finna";

registerAllOperators();
console.log(compile({ value: { $eq: 1 } })({ value: 1 })); // true
```

| Helper                        | Operators                                                                                                                                          |
| ----------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| `registerCoreOperators()`     | `$eq`, `$ne`, `$in`, `$nin`, `$gt`, `$gte`, `$lt`, `$lte`, `$all`, `$some`, `$none`, `$size`, `$exists`, `$type`, `$regex`                         |
| `registerDateOperators()`     | `$year`, `$month`, `$date`, `$weekday`, `$hour`, `$minute`, `$second`, `$ms`, `$utc`                                                               |
| `registerArrayOperators()`    | `$all`, `$some`, `$none`, `$size`                                                                                                                  |
| `registerExtendedOperators()` | `$truthy`, `$falsy`, `$nullish`, all `$is…` checks, `$startsWith`, `$endsWith`, `$includes`, `$uppercase`, `$lowercase`, `$replace`, `$replaceAll` |
| `registerAllOperators()`      | Core (including arrays), date, and extended groups, registered atomically                                                                          |

Core registration includes array operators. The standalone array helper remains available for array-only selections. Extended, array, and date registration do not implicitly register the other core operators. Nested queries require explicit registration of every operator they use. All registration helpers return idempotent cleanup functions and reject conflicting factories atomically.

For the smallest selection, import exactly the factories you need:

<!-- example: individual-factories -->
```typescript
import { compile, registerOperators } from "@fimbul-works/finna";
import { createEqPredicate } from "@fimbul-works/finna/equality/eq";
import { createGtPredicate } from "@fimbul-works/finna/comparison/gt";

const unregister = registerOperators([
  ["$eq", createEqPredicate],
  ["$gt", createGtPredicate],
]);

const matchesNode = compile({
  kind: { $eq: "Identifier" },
  end: { $gt: { $field: "start" } },
});

console.log(matchesNode({ kind: "Identifier", start: 5, end: 10 })); // true
unregister();
```

This needs no async initialization. Explicit factory imports let ESM bundlers remove unused implementations and let unbundled applications avoid importing unrelated operator modules. Named imports from the main entry point are also tree-shakable; the test suite checks both individual-factory and core-preset selections with tsdown. A central lookup containing every factory and indexed by runtime operator names would retain those factories. Dynamic imports would generally emit additional chunks for unselected implementations rather than omit them from the build.

Category helpers are available from the main entry point and their shorter direct subpaths. A category such as `/equality` exports `registerEqualityOperators()`; an individual path such as `/equality/eq` exports `createEqPredicate` without importing the category preset:

- `@fimbul-works/finna/equality`: `registerEqualityOperators()`
- `@fimbul-works/finna/comparison`: `registerComparisonOperators()`
- `@fimbul-works/finna/element`: `registerElementOperators()`
- `@fimbul-works/finna/string`: `registerStringOperators()` (all string operators)
- `@fimbul-works/finna/date`: `registerDateOperators()`
- `@fimbul-works/finna/array`: `registerArrayOperators()`

Finna uses MongoDB-inspired query syntax with JavaScript semantics. `$exists` treats `undefined` as absent and `null` as present. Literal array arguments to `$all`, `$some`, and `$none` use strict membership equality; nested item queries can use deep equality through `$eq`.

Preset helpers are also available directly from `/register-core`, `/register-extended`, and `/register-all`.

The registry lists configurable **filter operators**. Logical composition (`$and`, `$or`, `$not`, `$nor`), literal matching, predicate functions, and `$field` references remain engine syntax and do not require registration.

Element operators include `$truthy`, `$falsy`, and `$nullish` (their arguments are ignored), plus `$isNumber`, `$isString`, `$isInteger`, `$isObject`, `$isArray`, `$isDate`, and `$isSymbol`. The `$is…` checks take a boolean: `true` checks the type and `false` checks its inverse. `$isClass` takes a constructor, for example `{ value: { $isClass: MyClass } }`.

These checks use [@fimbul-works/hvat](https://www.npmjs.com/package/@fimbul-works/hvat) semantics: numbers include `NaN` and infinities; objects exclude null and arrays but include class instances; dates are Date instances, including invalid dates. `$type` accepts all JavaScript `typeof` names plus `array`, `date`, `null`, and `int`; its `object` check additionally excludes Date instances. Unsupported type names produce compilation errors. There is no `$isTimestamp` operator; date component operators accept Date instances or numeric Unix millisecond timestamps.

---

## Usage

### 1. One-Shot Pattern Matching (`match`)

<!-- example: match -->
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

<!-- example: compile -->
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
console.log(available);
// [{ id: "3", title: "USB-C Hub", price: 35, inStock: true }]
```

### 3. Selecting Operator Categories

<!-- example: categories -->
```typescript
import { match } from "@fimbul-works/finna";
import { registerComparisonOperators } from "@fimbul-works/finna/comparison";
import { registerEqualityOperators } from "@fimbul-works/finna/equality";

// The main entry point does not register operators automatically.
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

<!-- example: field-dates -->
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

console.log(isValidDeadline); // true
console.log(isMarch2024); // true
```

### 5. Predicate Functions as Filters

A filter can also be a predicate function itself, receiving the target value as the 1st parameter and the root value as the 2nd parameter:

<!-- example: predicates -->
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
  items: (qty, root): qty is number => qty * root.unitPrice <= root.budget,
});
console.log(withinBudget); // true

// 2. Predicates inside array operators
const hasShortTag = match(order, {
  tags: { $some: (tag): tag is string => tag.length < 8 },
});
console.log(hasShortTag); // true

// 3. Root-level predicate function
const isQualifying = compile<typeof order>((val, root): val is typeof order => val.items * root.unitPrice > 50);
console.log(isQualifying(order)); // true
```

### 6. String Transformations

`$uppercase` and `$lowercase` transform a string and apply a nested filter. `$replace` and `$replaceAll` take `{ search, replace, then }`, where `then` tests the replaced string. These operations leave the document unchanged. Nest transformations to specify their order; sibling operators each receive the original field value.

<!-- example: transformations -->
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

console.log(matchesSlug({ title: "Hello World", expectedSlug: "hello-world" })); // true

const matchesReplacement = compile({
  message: {
    $replaceAll: {
      search: { $field: "rules.search" },
      replace: { $field: "rules.replacement" },
      then: { $eq: { $field: "expectedMessage" } },
    },
  },
});

console.log(matchesReplacement({
  message: "Hi NAME, welcome NAME",
  rules: { search: "NAME", replacement: "Alice" },
  expectedMessage: "Hi Alice, welcome Alice",
})); // true
```

Searches accept literal strings, RegExp instances, or `$field` references to either. Replacement text accepts a string or `$field` reference. All references resolve against the original root document on every evaluation, including inside nested transformations.

`$replace` follows JavaScript `String.replace`: a string search replaces its first occurrence, and regex flags determine regex matching. `$replaceAll` replaces every string occurrence and requires `g` on regex searches. String searches are literal. Replacement strings use JavaScript substitution syntax, including `$$`, `$&`, and regex captures such as `$1`. Regex matching starts at index zero on each evaluation and leaves the supplied regex's `lastIndex` unchanged.

Non-string inputs and invalid referenced arguments return `false`. Invalid literal replacement arguments, a missing `then`, or a literal regex without `g` for `$replaceAll` produce compilation errors. Transformations keep intermediate strings local to each evaluation; they do not store temporary values in `FinnaContext`.

### 7. Custom Operator Registration

<!-- example: custom-operator -->
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

## Errors, warnings, and logging

`operatorMap` is a read-only view of installed names and factories; `listOperators()` returns an independent Map snapshot. Use `registerOperator(name, factory)` or `registerOperators(iterableOfEntries)` to install factories. Operator maps use `Map<OperatorName, OperatorFactory>`, where `OperatorName` is the template literal type `` `$${string}` ``. Registration and lookup APIs require dollar-prefixed names at compile time; registration also validates names at runtime. Registration batches are atomic. Re-registering the same factory is a no-op; a different factory requires `{ replace: true }`. Registration returns an idempotent cleanup function that only removes entries installed by that call, and never removes a later replacement. Replacement cleanup removes the replacement without restoring its predecessor. Use `unregisterOperator(name)` or `clearOperators()` for explicit removal. Already compiled predicates retain their factories' compiled behavior.

`compile()`, `createPredicate()`, and `match()` throw an `AggregateError` for invalid queries, including unregistered operators and invalid `$in`/`$nin` arguments. Nested filters compile eagerly, so errors are reported before data is tested, including inside array and logical branches.

<!-- example: compilation-errors -->
```typescript
import { compile, createFinnaContext, registerEqualityOperators } from "@fimbul-works/finna";

registerEqualityOperators();
const ctx = createFinnaContext(true); // UTC date operations
try {
  compile({ age: { $in: 42 }, role: { $nin: "admin" } }, ctx);
} catch (error) {
  if (!(error instanceof AggregateError)) throw error;
  for (const diagnostic of error.errors) {
    console.error(diagnostic.phase, diagnostic.path.join("."));
  }
}
// compile age.$in
// compile role.$nin
```

`FinnaContext` keeps separate `errors` and `warnings` histories. Diagnostics include a query `path`, `operator` when applicable, `phase` (`compile` or `evaluate`), `severity`, and the original exception as `cause`. Compilation failures and exceptions during predicate execution are aggregated at the outer operation boundary. Runtime type mismatches remain ordinary non-matches and do not produce diagnostics.

Defaults are `useUTC: false`, `throwErrors: true`, `warningsAsErrors: false`, `captureStacks: false`, and no logger. No behavior is inferred from `NODE_ENV`; Finna never writes to the console automatically. `createFinnaContext(true)` remains shorthand for `{ useUTC: true }`. `$utc` enables UTC only for its nested query, preserving diagnostic settings and the parent context. Applying `$utc` again is harmless.

Use the explicit result APIs when failures should be returned instead of thrown:

<!-- example: result-apis -->
```typescript
import { compileResult, createFinnaContext, evaluate, registerAllOperators } from "@fimbul-works/finna";

registerAllOperators();
const context = createFinnaContext({ throwErrors: false });
const result = evaluate({ value: 10, minimum: 5 }, { value: { $gt: { $field: "minimum" } } }, context);
console.log(result.matched); // true
// matched: false means a non-match; matched: null means compilation or execution failed.

const compilation = compileResult({ value: { $type: "number" } }, context);
console.log(compilation.predicate?.({ value: 10 })); // true

const invalid = compileResult({ value: { $type: "unsupported" } } as any, context);
console.log(invalid.predicate); // null
console.log(context.errors.length); // 1
```

`compile()`, `createPredicate()`, `createOperatorPredicate()`, `match()`, and compiled predicates remain strict: failures throw even when `throwErrors` is false. `compileResult()` and `evaluate()` honor that flag; with the default true they throw too. An invalid compilation never returns a partially working predicate. A failed evaluation cannot become a match through `$not`, `$nor`, or `$or`.

Each predicate invocation uses its own temporary diagnostic collection and appends it to the supplied context's history when finished. Aggregates contain only that operation's failures; old diagnostics do not invalidate later calls. Reentrant invocations are isolated. Matching preserves short-circuiting, so unexecuted branches do not produce diagnostics. Predicate evaluation is synchronous. Clear history in place with `context.errors.length = 0` and `context.warnings.length = 0` when it is no longer needed.

### Custom diagnostics and loggers

Custom operator factories can call `reportWarning(context, cause)` or `reportError(context, cause)` during compilation or inside the predicate they return. These helpers preserve locations, route runtime diagnostics to the current invocation, and log each diagnostic once. Direct pushes to the factory context's diagnostic arrays are also normalized at query boundaries; use the helpers rather than capturing a diagnostic array before execution.

<!-- example: custom-logger -->
```typescript
import { createFinnaContext, evaluate, reportWarning, registerOperator, type FilterPredicate, type FinnaLogger } from "@fimbul-works/finna";

registerOperator("$positive", (_expected, context) => {
  return ((value: number) => {
    if (value === 0) reportWarning(context, new Error("Zero encountered"));
    return value > 0;
  }) as FilterPredicate<number>;
});

const messages: string[] = [];
const logger: FinnaLogger = {
  warn: (details) => { messages.push(`${details.phase}:${details.path.join(".")}`); },
  error: (details) => { messages.push(`${details.phase}:${details.path.join(".")}`); },
};
const context = createFinnaContext({
  throwErrors: false,
  warningsAsErrors: true,
  captureStacks: true,
  logger,
});

const result = evaluate({ value: 0 }, { value: { $positive: true } as any }, context);
console.log(result.matched); // null: the warning was escalated
console.log(context.warnings.length, context.errors.length); // 1 0
console.log(messages); // ["evaluate:value.$positive"]
```

Runtime registration does not augment TypeScript's built-in operator types. For a typed document passed to `evaluate()` or `compile<T>()`, the example asserts only the custom operator object as `any`.

With `warningsAsErrors: true`, warnings make the operation fail but remain in `warnings` with warning severity. They are included in the aggregate when throwing is enabled. Built-in type mismatches do not create warnings.

An optional `FinnaLogger` accepts `warn(details, message)` and `error(details, message)`, matching Pino's object-first calling convention. Pass your Pino instance as `logger` when creating the context; Finna has no Pino dependency. Structured details include `err`, `phase`, `severity`, `path`, and `operator`, without automatically including document values. Escalated warnings still use `warn`. Logger exceptions are isolated from query behavior, and aggregation does not log diagnostics again.

`captureStacks: true` retains the complete diagnostic stack. Original exceptions remain available as `cause` regardless of that setting. A development logger can shorten the displayed stack to consumer frames; Finna does not truncate stacks or call `console.trace()` internally.

### Viewing diagnostics in tests

The diagnostic logger tests use `createTestLogger()` from `test-utils/test-logger.ts`. Its `warn` and `error` methods are Vitest mocks that forward to the matching console method when `NODE_ENV === "test"` (Vitest's default). Calls remain available through `.mock.calls` and assertions such as `toHaveBeenCalledTimes()`. Outside test mode the mocks record calls silently. Finna's default context remains silent in every environment.

Inside repository tests, pass `createTestLogger()` to `createFinnaContext({ logger })`. Its methods support assertions such as `expect(logger.error).toHaveBeenCalledTimes(1)`. This helper is test infrastructure, not a published Finna export.

Run `pnpm exec vitest run src/evaluate.test.ts src/compile-result.test.ts` to see example diagnostics. Use Vitest's `--silent` option when console output is unwanted.

## Documentation

For full type signatures and module documentation, refer to the generated [API documentation](docs/API.md).

## License

MIT License - See [LICENSE](LICENSE) file for details.

---

Built with ⚡ by [FimbulWorks](https://github.com/fimbul-works)
