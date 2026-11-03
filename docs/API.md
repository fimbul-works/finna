# ![@fimbul-works/finna](../finna-logo.svg)

## Classes

### QueryCompilationError

A query compilation error with its location and original cause.

#### Extends

- `Error`

#### Constructors

##### Constructor

```ts
new QueryCompilationError(cause, path?): QueryCompilationError;
```

Creates a diagnostic preserving the original error and query location.

###### Parameters

| Parameter | Type                              | Default value | Description                                             |
| --------- | --------------------------------- | ------------- | ------------------------------------------------------- |
| `cause`   | `unknown`                         | `undefined`   | The original error or thrown value.                     |
| `path`    | readonly (`string` \| `number`)[] | `[]`          | Query path segments; an empty path identifies the root. |

###### Returns

[`QueryCompilationError`](#querycompilationerror)

A diagnostic Error containing the path and original cause.

###### Overrides

```ts
Error.constructor;
```

#### Properties

| Property                                                | Modifier   | Type                              | Description                                                                                                                                                                                                                                                                                                                                                                                                                                       | Inherited from          |
| ------------------------------------------------------- | ---------- | --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------- |
| <a id="property-cause"></a> `cause?`                    | `public`   | `unknown`                         | -                                                                                                                                                                                                                                                                                                                                                                                                                                                 | `Error.cause`           |
| <a id="property-message"></a> `message`                 | `public`   | `string`                          | -                                                                                                                                                                                                                                                                                                                                                                                                                                                 | `Error.message`         |
| <a id="property-name"></a> `name`                       | `public`   | `string`                          | -                                                                                                                                                                                                                                                                                                                                                                                                                                                 | `Error.name`            |
| <a id="property-path"></a> `path`                       | `readonly` | readonly (`string` \| `number`)[] | -                                                                                                                                                                                                                                                                                                                                                                                                                                                 | -                       |
| <a id="property-stack"></a> `stack?`                    | `public`   | `string`                          | -                                                                                                                                                                                                                                                                                                                                                                                                                                                 | `Error.stack`           |
| <a id="property-stacktracelimit"></a> `stackTraceLimit` | `static`   | `number`                          | The `Error.stackTraceLimit` property specifies the number of stack frames collected by a stack trace (whether generated by `new Error().stack` or `Error.captureStackTrace(obj)`). The default value is `10` but may be set to any valid JavaScript number. Changes will affect any stack trace captured _after_ the value has been changed. If set to a non-number value, or set to a negative number, stack traces will not capture any frames. | `Error.stackTraceLimit` |

#### Methods

##### captureStackTrace()

```ts
static captureStackTrace(targetObject, constructorOpt?): void;
```

Creates a `.stack` property on `targetObject`, which when accessed returns
a string representing the location in the code at which
`Error.captureStackTrace()` was called.

```js
const myObject = {};
Error.captureStackTrace(myObject);
myObject.stack; // Similar to `new Error().stack`
```

The first line of the trace will be prefixed with
`${myObject.name}: ${myObject.message}`.

The optional `constructorOpt` argument accepts a function. If given, all frames
above `constructorOpt`, including `constructorOpt`, will be omitted from the
generated stack trace.

The `constructorOpt` argument is useful for hiding implementation
details of error generation from the user. For instance:

```js
function a() {
  b();
}

function b() {
  c();
}

function c() {
  // Create an error without stack trace to avoid calculating the stack trace twice.
  const { stackTraceLimit } = Error;
  Error.stackTraceLimit = 0;
  const error = new Error();
  Error.stackTraceLimit = stackTraceLimit;

  // Capture the stack trace above function b
  Error.captureStackTrace(error, b); // Neither function c, nor b is included in the stack trace
  throw error;
}

a();
```

###### Parameters

| Parameter         | Type       |
| ----------------- | ---------- |
| `targetObject`    | `object`   |
| `constructorOpt?` | `Function` |

###### Returns

`void`

###### Inherited from

```ts
Error.captureStackTrace;
```

##### isError()

```ts
static isError(error): error is Error;
```

Indicates whether the argument provided is a built-in Error instance or not.

###### Parameters

| Parameter | Type      |
| --------- | --------- |
| `error`   | `unknown` |

###### Returns

`error is Error`

###### Inherited from

```ts
Error.isError;
```

##### prepareStackTrace()

```ts
static prepareStackTrace(err, stackTraces): any;
```

###### Parameters

| Parameter     | Type         |
| ------------- | ------------ |
| `err`         | `Error`      |
| `stackTraces` | `CallSite`[] |

###### Returns

`any`

###### See

https://v8.dev/docs/stack-trace-api#customizing-stack-traces

###### Inherited from

```ts
Error.prepareStackTrace;
```

## Interfaces

### ArrayOperators

Array-specific query operators.

#### Type Parameters

| Type Parameter |
| -------------- |
| `T`            |

#### Properties

| Property                            | Type                                                                                                              | Description                                                          |
| ----------------------------------- | ----------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| <a id="property-all"></a> `$all?`   | \| [`QueryValue`](#queryvalue)\<`T`\> \| `T`[] \| `T` _extends_ `object` ? [`Query`](#query)\<`T`\> : `never`     | Must contain all specified values or match sub-query                 |
| <a id="property-none"></a> `$none?` | \| [`QueryValue`](#queryvalue)\<`T`\> \| `T`[] \| `T` _extends_ `object` ? [`Query`](#query)\<`T`\> : `never`     | Must not contain any of the specified values or match sub-query      |
| <a id="property-size"></a> `$size?` | \| `number` \| [`OperatorQuery`](#operatorquery)\<`number`\> \| [`FilterPredicate`](#filterpredicate)\<`number`\> | Size of the array                                                    |
| <a id="property-some"></a> `$some?` | \| [`QueryValue`](#queryvalue)\<`T`\> \| `T`[] \| `T` _extends_ `object` ? [`Query`](#query)\<`T`\> : `never`     | Must contain at least one of the specified values or match sub-query |

---

### ComparisonOperators

Combined comparison operators for sortable types.

#### Type Parameters

| Type Parameter |
| -------------- |
| `T`            |

#### Properties

| Property                          | Type                                       | Description                       |
| --------------------------------- | ------------------------------------------ | --------------------------------- |
| <a id="property-gt"></a> `$gt?`   | [`FieldReference`](#fieldreference) \| `T` | -                                 |
| <a id="property-gte"></a> `$gte?` | [`FieldReference`](#fieldreference) \| `T` | Greater than or equal to operator |
| <a id="property-lt"></a> `$lt?`   | [`FieldReference`](#fieldreference) \| `T` | Less than operator                |
| <a id="property-lte"></a> `$lte?` | [`FieldReference`](#fieldreference) \| `T` | Less than or equal to operator    |

---

### DateOperators

Date-specific query operators.

#### Properties

| Property                                  | Type                                                      | Description                                     |
| ----------------------------------------- | --------------------------------------------------------- | ----------------------------------------------- |
| <a id="property-date"></a> `$date?`       | `number` \| [`OperatorQuery`](#operatorquery)\<`number`\> | Day of month operator (1-31)                    |
| <a id="property-hour"></a> `$hour?`       | `number` \| [`OperatorQuery`](#operatorquery)\<`number`\> | Hour operator (0-23)                            |
| <a id="property-minute"></a> `$minute?`   | `number` \| [`OperatorQuery`](#operatorquery)\<`number`\> | Minute operator (0-59)                          |
| <a id="property-month"></a> `$month?`     | `number` \| [`OperatorQuery`](#operatorquery)\<`number`\> | Month operator (0-11)                           |
| <a id="property-ms"></a> `$ms?`           | `number` \| [`OperatorQuery`](#operatorquery)\<`number`\> | Millisecond operator (0-999)                    |
| <a id="property-second"></a> `$second?`   | `number` \| [`OperatorQuery`](#operatorquery)\<`number`\> | Second operator (0-59)                          |
| <a id="property-utc"></a> `$utc?`         | [`DateOperators`](#dateoperators)                         | Switch to UTC context for nested date operators |
| <a id="property-weekday"></a> `$weekday?` | `number` \| [`OperatorQuery`](#operatorquery)\<`number`\> | Day of week operator (0-6, 0 is Sunday)         |
| <a id="property-year"></a> `$year?`       | `number` \| [`OperatorQuery`](#operatorquery)\<`number`\> | Year operator                                   |

---

### ElementOperators

Element-specific query operators.

#### Properties

| Property                                | Type                        | Description                            |
| --------------------------------------- | --------------------------- | -------------------------------------- |
| <a id="property-exists"></a> `$exists?` | `boolean`                   | Check if property exists in root value |
| <a id="property-type"></a> `$type?`     | [`TypeString`](#typestring) | Check property type                    |

---

### EqualityOperators

Equality operators.

#### Type Parameters

| Type Parameter |
| -------------- |
| `T`            |

#### Properties

| Property                          | Type                                       | Description         |
| --------------------------------- | ------------------------------------------ | ------------------- |
| <a id="property-eq"></a> `$eq?`   | [`FieldReference`](#fieldreference) \| `T` | Equality operator   |
| <a id="property-in"></a> `$in?`   | `T`[]                                      | In operator         |
| <a id="property-ne"></a> `$ne?`   | [`FieldReference`](#fieldreference) \| `T` | Inequality operator |
| <a id="property-nin"></a> `$nin?` | `T`[]                                      | Not in operator     |

---

### FieldReference

Reference to another field in the same root value.

#### Properties

| Property                             | Type     |
| ------------------------------------ | -------- |
| <a id="property-field"></a> `$field` | `string` |

---

### FinnaContext

Context for a predicate execution.

#### Extends

- `Record`\<`string`, `any`\>

#### Indexable

```ts
[key: string]: any
```

#### Properties

| Property                              | Type                              | Description                                                                |
| ------------------------------------- | --------------------------------- | -------------------------------------------------------------------------- |
| <a id="property-errors"></a> `errors` | `Error`[]                         | Errors collected during compilation; matching never appends to this array. |
| <a id="property-path-1"></a> `path?`  | readonly (`string` \| `number`)[] | Location within the query, used in compilation diagnostics.                |
| <a id="property-useutc"></a> `useUTC` | `boolean`                         | Whether to use UTC for date-related comparisons                            |

---

### LogicalOperators

Logical operators for combining queries.

#### Type Parameters

| Type Parameter |
| -------------- |
| `T`            |

#### Properties

| Property                          | Type                       | Description          |
| --------------------------------- | -------------------------- | -------------------- |
| <a id="property-and"></a> `$and?` | [`Query`](#query)\<`T`\>[] | Logical AND operator |
| <a id="property-nor"></a> `$nor?` | [`Query`](#query)\<`T`\>[] | Logical NOR operator |
| <a id="property-not"></a> `$not?` | [`Query`](#query)\<`T`\>   | Logical NOT operator |
| <a id="property-or"></a> `$or?`   | [`Query`](#query)\<`T`\>[] | Logical OR operator  |

---

### StringOperators

String-specific query operators.

#### Properties

| Property                                        | Type                                            | Description              |
| ----------------------------------------------- | ----------------------------------------------- | ------------------------ |
| <a id="property-endswith"></a> `$endsWith?`     | `string` \| [`FieldReference`](#fieldreference) | Ends with string         |
| <a id="property-includes"></a> `$includes?`     | `string` \| [`FieldReference`](#fieldreference) | Includes substring       |
| <a id="property-regex"></a> `$regex?`           | `string` \| `RegExp`                            | Regular expression match |
| <a id="property-startswith"></a> `$startsWith?` | `string` \| [`FieldReference`](#fieldreference) | Starts with string       |

## Type Aliases

### ArrayOperator

```ts
type ArrayOperator = keyof ArrayOperators<any>;
```

Supported array operators.

---

### ComparisonOperator

```ts
type ComparisonOperator = keyof ComparisonOperators<any>;
```

Supported comparison operators.

---

### DateOperator

```ts
type DateOperator = keyof DateOperators;
```

Supported date operators.

---

### ElementOperator

```ts
type ElementOperator = keyof ElementOperators;
```

Supported element operators.

---

### EqualityOperator

```ts
type EqualityOperator = keyof EqualityOperators<any>;
```

Supported equality operators.

---

### FilterPredicate

```ts
type FilterPredicate<T> = (val, root?) => val is T;
```

A filter predicate function that receives the value and the root value.

#### Type Parameters

| Type Parameter | Default type | Description               |
| -------------- | ------------ | ------------------------- |
| `T`            | `any`        | Type of the value to test |

#### Parameters

| Parameter | Type  | Description                          |
| --------- | ----- | ------------------------------------ |
| `val`     | `any` | The value to test                    |
| `root?`   | `any` | The root value for field comparisons |

#### Returns

`val is T`

True if matched, false otherwise

---

### LogicalOperator

```ts
type LogicalOperator = keyof LogicalOperators<any>;
```

Supported operator strings for internal matching logic.

---

### OperatorFactory

```ts
type OperatorFactory = (expected, context) => FilterPredicate;
```

Compiles an operator argument into a reusable predicate.

#### Parameters

| Parameter  | Type                            | Description                                                         |
| ---------- | ------------------------------- | ------------------------------------------------------------------- |
| `expected` | `any`                           | The operator argument, which may contain a nested filter.           |
| `context`  | [`FinnaContext`](#finnacontext) | Compilation context providing date settings and shared diagnostics. |

#### Returns

[`FilterPredicate`](#filterpredicate)

The predicate used to test an actual value and optional root value.

#### Throws

If the operator argument cannot be compiled.

---

### OperatorMap

```ts
type OperatorMap<Name> = Map<Name, OperatorFactory>;
```

Registry of explicitly installed filter operators.

#### Type Parameters

| Type Parameter                                   | Default type                    |
| ------------------------------------------------ | ------------------------------- |
| `Name` _extends_ [`OperatorName`](#operatorname) | [`OperatorName`](#operatorname) |

---

### OperatorName

```ts
type OperatorName = `$${string}`;
```

Operator names must start with a dollar sign, including custom operators.

---

### OperatorQuery

```ts
type OperatorQuery<T> = EqualityOperators<T> & ElementOperators & T extends Sortable ? ComparisonOperators<T> : object & T extends string ? StringOperators : object & T extends Date ? DateOperators : object & T extends infer I[] ? ArrayOperators<I> : object;
```

Full operator query for a value.

#### Type Parameters

| Type Parameter |
| -------------- |
| `T`            |

---

### Query

```ts
type Query<T> = QueryObject<T> | FilterPredicate<T>;
```

Recursively define Query type.
A query can be an object query specification or a filter predicate function.
Supports top-level keys of T, arbitrary string paths (dotted notation), and root-level predicate functions.

#### Type Parameters

| Type Parameter |
| -------------- |
| `T`            |

---

### QueryObject

```ts
type QueryObject<T> = {
  [K in keyof T]?: QueryValue<T[K]> | (T[K] extends object ? Query<T[K]> : never);
} & LogicalOperators<T> & {
    [path: string]: any;
  };
```

Object-based query specification for a type T.

#### Type Parameters

| Type Parameter |
| -------------- |
| `T`            |

---

### QueryOperator

```ts
type QueryOperator =
  | EqualityOperator
  | ComparisonOperator
  | StringOperator
  | DateOperator
  | ArrayOperator
  | ElementOperator;
```

Supported query operators.

---

### QueryValue

```ts
type QueryValue<T> = T | OperatorQuery<T> | FieldReference | T extends string ? RegExp : never | FilterPredicate<T>;
```

A query value can be a literal, an operator object, a RegExp (for strings), or a filter predicate function.

#### Type Parameters

| Type Parameter |
| -------------- |
| `T`            |

---

### Sortable

```ts
type Sortable = string | number | Date;
```

Sortable types for comparison operators ($gt, $lt, etc.)

---

### StringOperator

```ts
type StringOperator = keyof StringOperators;
```

Supported string operators.

---

### TypeString

```ts
type TypeString = "string" | "number" | "boolean" | "array" | "object" | "null" | "undefined" | "date";
```

Type strings supported by $type operator.

## Variables

### operatorMap

```ts
const operatorMap: ReadonlyMap<OperatorName, OperatorFactory> = operators;
```

Read-only view of installed filter operators and their factories.

## Functions

### clearOperators()

```ts
function clearOperators(): void;
```

Removes every installed filter operator and its registration ownership.

#### Returns

`void`

Nothing. Previously compiled predicates remain usable.

---

### compile()

```ts
function compile<T>(pattern, ctx?): FilterPredicate<T>;
```

Compiles a query/pattern specification into an optimized, reusable predicate function.

#### Type Parameters

| Type Parameter                            | Description            |
| ----------------------------------------- | ---------------------- |
| `T` _extends_ `Record`\<`string`, `any`\> | Type of value to match |

#### Parameters

| Parameter | Type                            | Description                                |
| --------- | ------------------------------- | ------------------------------------------ |
| `pattern` | [`Query`](#query)\<`T`\>        | The query/pattern specification to compile |
| `ctx?`    | [`FinnaContext`](#finnacontext) | Optional query context                     |

#### Returns

[`FilterPredicate`](#filterpredicate)\<`T`\>

A compiled predicate function `(value) => boolean`

#### Throws

If the query contains invalid or unregistered operators or invalid arguments.

---

### createAllPredicate()

```ts
function createAllPredicate(expected, ctx): FilterPredicate;
```

Creates a predicate requiring all requested values or every item to match.

#### Parameters

| Parameter  | Type                            | Description                                                           |
| ---------- | ------------------------------- | --------------------------------------------------------------------- |
| `expected` | `any`                           | An array of required values, or a filter applied to every array item. |
| `ctx`      | [`FinnaContext`](#finnacontext) | Compilation context shared with nested filters.                       |

#### Returns

[`FilterPredicate`](#filterpredicate)

A predicate that rejects non-arrays and checks membership or every item.

#### Throws

If a nested filter is invalid when compiled outside another compilation.

---

### createArrayPredicate()

```ts
function createArrayPredicate(operator, expected, ctx): FilterPredicate;
```

Creates a predicate using a built-in array factory without registering it.

#### Parameters

| Parameter  | Type                                               | Description                                           |
| ---------- | -------------------------------------------------- | ----------------------------------------------------- |
| `operator` | keyof [`ArrayOperators`](#arrayoperators)\<`any`\> | The array operator to compile.                        |
| `expected` | `any`                                              | The operator argument or nested filter.               |
| `ctx`      | [`FinnaContext`](#finnacontext)                    | Compilation context shared with the selected factory. |

#### Returns

[`FilterPredicate`](#filterpredicate)

The compiled predicate returned by the selected factory.

#### Throws

If operator is not a built-in array operator, or its factory rejects the argument.

---

### createComparisonPredicate()

```ts
function createComparisonPredicate(operator, expected, ctx): FilterPredicate;
```

Creates a predicate using a built-in comparison factory without registering it.

#### Parameters

| Parameter  | Type                                                         | Description                                           |
| ---------- | ------------------------------------------------------------ | ----------------------------------------------------- |
| `operator` | keyof [`ComparisonOperators`](#comparisonoperators)\<`any`\> | The comparison operator to compile.                   |
| `expected` | `any`                                                        | The operator argument or nested filter.               |
| `ctx`      | [`FinnaContext`](#finnacontext)                              | Compilation context shared with the selected factory. |

#### Returns

[`FilterPredicate`](#filterpredicate)

The compiled predicate returned by the selected factory.

#### Throws

If operator is not a built-in comparison operator, or its factory rejects the argument.

---

### createDateOfMonthPredicate()

```ts
function createDateOfMonthPredicate(expected, ctx): FilterPredicate;
```

Creates a predicate for the day of the month (1–31) of a date or timestamp.

#### Parameters

| Parameter  | Type                            | Description                                                                |
| ---------- | ------------------------------- | -------------------------------------------------------------------------- |
| `expected` | `any`                           | An exact component value, or a filter applied to the extracted component.  |
| `ctx`      | [`FinnaContext`](#finnacontext) | Compilation context; useUTC selects UTC rather than local date components. |

#### Returns

[`FilterPredicate`](#filterpredicate)

A predicate that rejects invalid dates and non-date values, and tests the date component.

#### Throws

If a nested filter is invalid when compiled outside another compilation.

---

### createDatePredicate()

```ts
function createDatePredicate(operator, expected, ctx): FilterPredicate;
```

Creates a predicate using a built-in date factory without registering it.

#### Parameters

| Parameter  | Type                                    | Description                                           |
| ---------- | --------------------------------------- | ----------------------------------------------------- |
| `operator` | keyof [`DateOperators`](#dateoperators) | The date operator to compile.                         |
| `expected` | `any`                                   | The operator argument or nested filter.               |
| `ctx`      | [`FinnaContext`](#finnacontext)         | Compilation context shared with the selected factory. |

#### Returns

[`FilterPredicate`](#filterpredicate)

The compiled predicate returned by the selected factory.

#### Throws

If operator is not a built-in date operator, or its factory rejects the argument.

---

### createElementPredicate()

```ts
function createElementPredicate(operator, expected, ctx): FilterPredicate;
```

Creates a predicate using a built-in element factory without registering it.

#### Parameters

| Parameter  | Type                                          | Description                                           |
| ---------- | --------------------------------------------- | ----------------------------------------------------- |
| `operator` | keyof [`ElementOperators`](#elementoperators) | The element operator to compile.                      |
| `expected` | `any`                                         | The operator argument or nested filter.               |
| `ctx`      | [`FinnaContext`](#finnacontext)               | Compilation context shared with the selected factory. |

#### Returns

[`FilterPredicate`](#filterpredicate)

The compiled predicate returned by the selected factory.

#### Throws

If operator is not a built-in element operator, or its factory rejects the argument.

---

### createEndsWithPredicate()

```ts
function createEndsWithPredicate(expected, ctx): FilterPredicate;
```

Creates a predicate requiring a string that ends with the expected text.

#### Parameters

| Parameter  | Type                            | Description                                                               |
| ---------- | ------------------------------- | ------------------------------------------------------------------------- |
| `expected` | `any`                           | Text or a $field reference whose resolved value is converted to a string. |
| `ctx`      | [`FinnaContext`](#finnacontext) | Compilation context, accepted for the common operator factory interface.  |

#### Returns

[`FilterPredicate`](#filterpredicate)

A predicate that rejects non-strings and checks whether the string ends with the resolved text.

---

### createEqPredicate()

```ts
function createEqPredicate(expected, ctx): FilterPredicate;
```

Creates a predicate for deep equality.

#### Parameters

| Parameter  | Type                            | Description                                                              |
| ---------- | ------------------------------- | ------------------------------------------------------------------------ |
| `expected` | `any`                           | A literal value or a $field reference resolved against the root value.   |
| `ctx`      | [`FinnaContext`](#finnacontext) | Compilation context, accepted for the common operator factory interface. |

#### Returns

[`FilterPredicate`](#filterpredicate)

A predicate that matches deeply equal values.

---

### createEqualityPredicate()

```ts
function createEqualityPredicate(operator, expected, ctx): FilterPredicate;
```

Creates a predicate using a built-in equality factory without registering it.

#### Parameters

| Parameter  | Type                                                     | Description                                           |
| ---------- | -------------------------------------------------------- | ----------------------------------------------------- |
| `operator` | keyof [`EqualityOperators`](#equalityoperators)\<`any`\> | The equality operator to compile.                     |
| `expected` | `any`                                                    | The operator argument or nested filter.               |
| `ctx`      | [`FinnaContext`](#finnacontext)                          | Compilation context shared with the selected factory. |

#### Returns

[`FilterPredicate`](#filterpredicate)

The compiled predicate returned by the selected factory.

#### Throws

If operator is not a built-in equality operator, or its factory rejects the argument.

---

### createExistsPredicate()

```ts
function createExistsPredicate(expected, ctx): FilterPredicate;
```

Creates a predicate for the presence or absence of a value.

#### Parameters

| Parameter  | Type                            | Description                                                              |
| ---------- | ------------------------------- | ------------------------------------------------------------------------ |
| `expected` | `any`                           | Whether a defined value is required; falsy values request undefined.     |
| `ctx`      | [`FinnaContext`](#finnacontext) | Compilation context, accepted for the common operator factory interface. |

#### Returns

[`FilterPredicate`](#filterpredicate)

A predicate testing whether the actual value is defined or undefined.

---

### createFinnaContext()

```ts
function createFinnaContext(useUTC?): FinnaContext;
```

Creates a compilation context with an empty diagnostic collection.

#### Parameters

| Parameter | Type      | Default value | Description                                                   |
| --------- | --------- | ------------- | ------------------------------------------------------------- |
| `useUTC`  | `boolean` | `false`       | Whether date operators use UTC components; defaults to false. |

#### Returns

[`FinnaContext`](#finnacontext)

A new context with the requested date mode and an empty errors array.

---

### createGtePredicate()

```ts
function createGtePredicate(expected, ctx): FilterPredicate;
```

Creates a predicate requiring the actual value to be greater than or equal to the expected value.

#### Parameters

| Parameter  | Type                            | Description                                                               |
| ---------- | ------------------------------- | ------------------------------------------------------------------------- |
| `expected` | `any`                           | A comparison value or a $field reference resolved against the root value. |
| `ctx`      | [`FinnaContext`](#finnacontext) | Compilation context, accepted for the common operator factory interface.  |

#### Returns

[`FilterPredicate`](#filterpredicate)

A predicate testing whether the actual value is greater than or equal to the resolved value.

---

### createGtPredicate()

```ts
function createGtPredicate(expected, ctx): FilterPredicate;
```

Creates a predicate requiring the actual value to be greater than the expected value.

#### Parameters

| Parameter  | Type                            | Description                                                               |
| ---------- | ------------------------------- | ------------------------------------------------------------------------- |
| `expected` | `any`                           | A comparison value or a $field reference resolved against the root value. |
| `ctx`      | [`FinnaContext`](#finnacontext) | Compilation context, accepted for the common operator factory interface.  |

#### Returns

[`FilterPredicate`](#filterpredicate)

A predicate testing whether the actual value is greater than the resolved value.

---

### createHourPredicate()

```ts
function createHourPredicate(expected, ctx): FilterPredicate;
```

Creates a predicate for the hour (0–23) of a date or timestamp.

#### Parameters

| Parameter  | Type                            | Description                                                                |
| ---------- | ------------------------------- | -------------------------------------------------------------------------- |
| `expected` | `any`                           | An exact component value, or a filter applied to the extracted component.  |
| `ctx`      | [`FinnaContext`](#finnacontext) | Compilation context; useUTC selects UTC rather than local date components. |

#### Returns

[`FilterPredicate`](#filterpredicate)

A predicate that rejects invalid dates and non-date values, and tests the date component.

#### Throws

If a nested filter is invalid when compiled outside another compilation.

---

### createIncludesPredicate()

```ts
function createIncludesPredicate(expected, ctx): FilterPredicate;
```

Creates a predicate requiring a string that contains the expected text.

#### Parameters

| Parameter  | Type                            | Description                                                               |
| ---------- | ------------------------------- | ------------------------------------------------------------------------- |
| `expected` | `any`                           | Text or a $field reference whose resolved value is converted to a string. |
| `ctx`      | [`FinnaContext`](#finnacontext) | Compilation context, accepted for the common operator factory interface.  |

#### Returns

[`FilterPredicate`](#filterpredicate)

A predicate that rejects non-strings and checks whether the string contains the resolved text.

---

### createInPredicate()

```ts
function createInPredicate(expected, ctx): FilterPredicate;
```

Creates a predicate for membership using deep equality.

#### Parameters

| Parameter  | Type                            | Description                                                              |
| ---------- | ------------------------------- | ------------------------------------------------------------------------ |
| `expected` | `any`                           | An array of allowed values.                                              |
| `ctx`      | [`FinnaContext`](#finnacontext) | Compilation context, accepted for the common operator factory interface. |

#### Returns

[`FilterPredicate`](#filterpredicate)

A predicate that matches a value deeply equal to at least one allowed value.

#### Throws

If expected is not an array.

---

### createLtePredicate()

```ts
function createLtePredicate(expected, ctx): FilterPredicate;
```

Creates a predicate requiring the actual value to be less than or equal to the expected value.

#### Parameters

| Parameter  | Type                            | Description                                                               |
| ---------- | ------------------------------- | ------------------------------------------------------------------------- |
| `expected` | `any`                           | A comparison value or a $field reference resolved against the root value. |
| `ctx`      | [`FinnaContext`](#finnacontext) | Compilation context, accepted for the common operator factory interface.  |

#### Returns

[`FilterPredicate`](#filterpredicate)

A predicate testing whether the actual value is less than or equal to the resolved value.

---

### createLtPredicate()

```ts
function createLtPredicate(expected, ctx): FilterPredicate;
```

Creates a predicate requiring the actual value to be less than the expected value.

#### Parameters

| Parameter  | Type                            | Description                                                               |
| ---------- | ------------------------------- | ------------------------------------------------------------------------- |
| `expected` | `any`                           | A comparison value or a $field reference resolved against the root value. |
| `ctx`      | [`FinnaContext`](#finnacontext) | Compilation context, accepted for the common operator factory interface.  |

#### Returns

[`FilterPredicate`](#filterpredicate)

A predicate testing whether the actual value is less than the resolved value.

---

### createMinutePredicate()

```ts
function createMinutePredicate(expected, ctx): FilterPredicate;
```

Creates a predicate for the minute (0–59) of a date or timestamp.

#### Parameters

| Parameter  | Type                            | Description                                                                |
| ---------- | ------------------------------- | -------------------------------------------------------------------------- |
| `expected` | `any`                           | An exact component value, or a filter applied to the extracted component.  |
| `ctx`      | [`FinnaContext`](#finnacontext) | Compilation context; useUTC selects UTC rather than local date components. |

#### Returns

[`FilterPredicate`](#filterpredicate)

A predicate that rejects invalid dates and non-date values, and tests the date component.

#### Throws

If a nested filter is invalid when compiled outside another compilation.

---

### createMonthPredicate()

```ts
function createMonthPredicate(expected, ctx): FilterPredicate;
```

Creates a predicate for the zero-based month (0–11) of a date or timestamp.

#### Parameters

| Parameter  | Type                            | Description                                                                |
| ---------- | ------------------------------- | -------------------------------------------------------------------------- |
| `expected` | `any`                           | An exact component value, or a filter applied to the extracted component.  |
| `ctx`      | [`FinnaContext`](#finnacontext) | Compilation context; useUTC selects UTC rather than local date components. |

#### Returns

[`FilterPredicate`](#filterpredicate)

A predicate that rejects invalid dates and non-date values, and tests the date component.

#### Throws

If a nested filter is invalid when compiled outside another compilation.

---

### createMsPredicate()

```ts
function createMsPredicate(expected, ctx): FilterPredicate;
```

Creates a predicate for the millisecond (0–999) of a date or timestamp.

#### Parameters

| Parameter  | Type                            | Description                                                                |
| ---------- | ------------------------------- | -------------------------------------------------------------------------- |
| `expected` | `any`                           | An exact component value, or a filter applied to the extracted component.  |
| `ctx`      | [`FinnaContext`](#finnacontext) | Compilation context; useUTC selects UTC rather than local date components. |

#### Returns

[`FilterPredicate`](#filterpredicate)

A predicate that rejects invalid dates and non-date values, and tests the date component.

#### Throws

If a nested filter is invalid when compiled outside another compilation.

---

### createNePredicate()

```ts
function createNePredicate(expected, ctx): FilterPredicate;
```

Creates a predicate for deep inequality.

#### Parameters

| Parameter  | Type                            | Description                                                              |
| ---------- | ------------------------------- | ------------------------------------------------------------------------ |
| `expected` | `any`                           | A literal value or a $field reference resolved against the root value.   |
| `ctx`      | [`FinnaContext`](#finnacontext) | Compilation context, accepted for the common operator factory interface. |

#### Returns

[`FilterPredicate`](#filterpredicate)

A predicate that matches values that are not deeply equal.

---

### createNinPredicate()

```ts
function createNinPredicate(expected, ctx): FilterPredicate;
```

Creates a predicate for excluded membership using deep equality.

#### Parameters

| Parameter  | Type                            | Description                                                              |
| ---------- | ------------------------------- | ------------------------------------------------------------------------ |
| `expected` | `any`                           | An array of excluded values.                                             |
| `ctx`      | [`FinnaContext`](#finnacontext) | Compilation context, accepted for the common operator factory interface. |

#### Returns

[`FilterPredicate`](#filterpredicate)

A predicate that matches values not deeply equal to any excluded value.

#### Throws

If expected is not an array.

---

### createNonePredicate()

```ts
function createNonePredicate(expected, ctx): FilterPredicate;
```

Creates a predicate requiring no requested values or matching items.

#### Parameters

| Parameter  | Type                            | Description                                                            |
| ---------- | ------------------------------- | ---------------------------------------------------------------------- |
| `expected` | `any`                           | An array of excluded values, or a filter that no array item may match. |
| `ctx`      | [`FinnaContext`](#finnacontext) | Compilation context shared with nested filters.                        |

#### Returns

[`FilterPredicate`](#filterpredicate)

A predicate that rejects non-arrays and requires no matching items.

#### Throws

If a nested filter is invalid when compiled outside another compilation.

---

### createOperatorPredicate()

```ts
function createOperatorPredicate<T>(operator, expected, ctx): FilterPredicate<T>;
```

Create a predicate for a specific operator.

#### Type Parameters

| Type Parameter | Default type | Description |
| -------------- | ------------ | ----------- |
| `T`            | `any`        |             |

#### Parameters

| Parameter  | Type                            | Description                             |
| ---------- | ------------------------------- | --------------------------------------- |
| `operator` | `` `$${string}` ``              | The operator string (e.g. '$eq', '$gt') |
| `expected` | `any`                           | The expected value or nested filter     |
| `ctx`      | [`FinnaContext`](#finnacontext) | Query context                           |

#### Returns

[`FilterPredicate`](#filterpredicate)\<`T`\>

A predicate function for the operator

#### Throws

If the query contains invalid or unregistered operators or invalid arguments.

---

### createPredicate()

```ts
function createPredicate<T>(filter, ctx?): FilterPredicate<T>;
```

Create a predicate function from a query value.

#### Type Parameters

| Type Parameter | Default type | Description               |
| -------------- | ------------ | ------------------------- |
| `T`            | `any`        | Type of the value to test |

#### Parameters

| Parameter | Type                            | Description                                |
| --------- | ------------------------------- | ------------------------------------------ |
| `filter`  | `any`                           | The query filter to create a predicate for |
| `ctx?`    | [`FinnaContext`](#finnacontext) | Optional query context                     |

#### Returns

[`FilterPredicate`](#filterpredicate)\<`T`\>

A predicate function for the given filter

#### Throws

If the query contains invalid or unregistered operators or invalid arguments.

---

### createRegexPredicate()

```ts
function createRegexPredicate(expected, ctx): FilterPredicate;
```

Creates a predicate matching strings against a regular expression.

#### Parameters

| Parameter  | Type                            | Description                                                                   |
| ---------- | ------------------------------- | ----------------------------------------------------------------------------- |
| `expected` | `any`                           | A RegExp instance or a value converted to a regular expression source string. |
| `ctx`      | [`FinnaContext`](#finnacontext) | Compilation context, accepted for the common operator factory interface.      |

#### Returns

[`FilterPredicate`](#filterpredicate)

A predicate that rejects non-strings and tests the regular expression.

#### Throws

If the regular expression source is invalid.

---

### createSecondPredicate()

```ts
function createSecondPredicate(expected, ctx): FilterPredicate;
```

Creates a predicate for the second (0–59) of a date or timestamp.

#### Parameters

| Parameter  | Type                            | Description                                                                |
| ---------- | ------------------------------- | -------------------------------------------------------------------------- |
| `expected` | `any`                           | An exact component value, or a filter applied to the extracted component.  |
| `ctx`      | [`FinnaContext`](#finnacontext) | Compilation context; useUTC selects UTC rather than local date components. |

#### Returns

[`FilterPredicate`](#filterpredicate)

A predicate that rejects invalid dates and non-date values, and tests the date component.

#### Throws

If a nested filter is invalid when compiled outside another compilation.

---

### createSizePredicate()

```ts
function createSizePredicate(expected, ctx): FilterPredicate;
```

Creates a predicate for an array's length.

#### Parameters

| Parameter  | Type                            | Description                                               |
| ---------- | ------------------------------- | --------------------------------------------------------- |
| `expected` | `any`                           | An exact length, or a filter applied to the array length. |
| `ctx`      | [`FinnaContext`](#finnacontext) | Compilation context shared with nested filters.           |

#### Returns

[`FilterPredicate`](#filterpredicate)

A predicate that rejects non-arrays and tests their length.

#### Throws

If a nested filter is invalid when compiled outside another compilation.

---

### createSomePredicate()

```ts
function createSomePredicate(expected, ctx): FilterPredicate;
```

Creates a predicate requiring at least one requested value or matching item.

#### Parameters

| Parameter  | Type                            | Description                                                       |
| ---------- | ------------------------------- | ----------------------------------------------------------------- |
| `expected` | `any`                           | An array of candidate values, or a filter applied to array items. |
| `ctx`      | [`FinnaContext`](#finnacontext) | Compilation context shared with nested filters.                   |

#### Returns

[`FilterPredicate`](#filterpredicate)

A predicate that rejects non-arrays and requires at least one match.

#### Throws

If a nested filter is invalid when compiled outside another compilation.

---

### createStartsWithPredicate()

```ts
function createStartsWithPredicate(expected, ctx): FilterPredicate;
```

Creates a predicate requiring a string that starts with the expected text.

#### Parameters

| Parameter  | Type                            | Description                                                               |
| ---------- | ------------------------------- | ------------------------------------------------------------------------- |
| `expected` | `any`                           | Text or a $field reference whose resolved value is converted to a string. |
| `ctx`      | [`FinnaContext`](#finnacontext) | Compilation context, accepted for the common operator factory interface.  |

#### Returns

[`FilterPredicate`](#filterpredicate)

A predicate that rejects non-strings and checks whether the string starts with the resolved text.

---

### createStringPredicate()

```ts
function createStringPredicate(operator, expected, ctx): FilterPredicate;
```

Creates a predicate using a built-in string factory without registering it.

#### Parameters

| Parameter  | Type                                        | Description                                           |
| ---------- | ------------------------------------------- | ----------------------------------------------------- |
| `operator` | keyof [`StringOperators`](#stringoperators) | The string operator to compile.                       |
| `expected` | `any`                                       | The operator argument or nested filter.               |
| `ctx`      | [`FinnaContext`](#finnacontext)             | Compilation context shared with the selected factory. |

#### Returns

[`FilterPredicate`](#filterpredicate)

The compiled predicate returned by the selected factory.

#### Throws

If operator is not a built-in string operator, or its factory rejects the argument.

---

### createTypePredicate()

```ts
function createTypePredicate(expected, ctx): FilterPredicate;
```

Creates a predicate for a JavaScript value type.

#### Parameters

| Parameter  | Type                            | Description                                                              |
| ---------- | ------------------------------- | ------------------------------------------------------------------------ |
| `expected` | `any`                           | The requested type name, including array, date, null, and undefined.     |
| `ctx`      | [`FinnaContext`](#finnacontext) | Compilation context, accepted for the common operator factory interface. |

#### Returns

[`FilterPredicate`](#filterpredicate)

A predicate checking the requested type.

---

### createUtcPredicate()

```ts
function createUtcPredicate(expected, ctx): FilterPredicate;
```

Creates a nested predicate using UTC date components.

#### Parameters

| Parameter  | Type                            | Description                                     |
| ---------- | ------------------------------- | ----------------------------------------------- |
| `expected` | `any`                           | A nested date filter compiled with UTC enabled. |
| `ctx`      | [`FinnaContext`](#finnacontext) | Compilation context shared with nested filters. |

#### Returns

[`FilterPredicate`](#filterpredicate)

A predicate evaluating the nested filter with UTC date operations.

#### Throws

If a nested filter is invalid when compiled outside another compilation.

---

### createWeekdayPredicate()

```ts
function createWeekdayPredicate(expected, ctx): FilterPredicate;
```

Creates a predicate for the day of the week (0–6, starting with Sunday) of a date or timestamp.

#### Parameters

| Parameter  | Type                            | Description                                                                |
| ---------- | ------------------------------- | -------------------------------------------------------------------------- |
| `expected` | `any`                           | An exact component value, or a filter applied to the extracted component.  |
| `ctx`      | [`FinnaContext`](#finnacontext) | Compilation context; useUTC selects UTC rather than local date components. |

#### Returns

[`FilterPredicate`](#filterpredicate)

A predicate that rejects invalid dates and non-date values, and tests the date component.

#### Throws

If a nested filter is invalid when compiled outside another compilation.

---

### createYearPredicate()

```ts
function createYearPredicate(expected, ctx): FilterPredicate;
```

Creates a predicate for the full year of a date or timestamp.

#### Parameters

| Parameter  | Type                            | Description                                                                |
| ---------- | ------------------------------- | -------------------------------------------------------------------------- |
| `expected` | `any`                           | An exact component value, or a filter applied to the extracted component.  |
| `ctx`      | [`FinnaContext`](#finnacontext) | Compilation context; useUTC selects UTC rather than local date components. |

#### Returns

[`FilterPredicate`](#filterpredicate)

A predicate that rejects invalid dates and non-date values, and tests the date component.

#### Throws

If a nested filter is invalid when compiled outside another compilation.

---

### getOperator()

```ts
function getOperator(operator): OperatorFactory | undefined;
```

Looks up the factory for an installed filter operator.

#### Parameters

| Parameter  | Type               | Description                          |
| ---------- | ------------------ | ------------------------------------ |
| `operator` | `` `$${string}` `` | The dollar-prefixed name to look up. |

#### Returns

[`OperatorFactory`](#operatorfactory) \| `undefined`

The installed factory, or undefined if the operator is unavailable.

---

### hasOperator()

```ts
function hasOperator(operator): boolean;
```

Checks whether a filter operator is installed.

#### Parameters

| Parameter  | Type               | Description                          |
| ---------- | ------------------ | ------------------------------------ |
| `operator` | `` `$${string}` `` | The dollar-prefixed name to look up. |

#### Returns

`boolean`

True if the operator is currently registered.

---

### isOperatorObject()

```ts
function isOperatorObject(val): val is Record<string, any>;
```

Checks if a value is a nonempty operator object whose keys all start with $.

#### Parameters

| Parameter | Type  | Description    |
| --------- | ----- | -------------- |
| `val`     | `any` | Value to check |

#### Returns

`val is Record<string, any>`

`true` if it's an operator object, `false` otherwise

---

### listOperators()

```ts
function listOperators(): OperatorMap;
```

Copies the currently installed operator names and factories.

#### Returns

[`OperatorMap`](#operatormap)

An independent map snapshot; modifying it does not affect the registry.

---

### match()

```ts
function match<T>(value, pattern, ctx?): value is T;
```

Checks if a value satisfies a query/pattern specification.

#### Type Parameters

| Type Parameter                            | Description            |
| ----------------------------------------- | ---------------------- |
| `T` _extends_ `Record`\<`string`, `any`\> | Type of value to match |

#### Parameters

| Parameter | Type                            | Description                        |
| --------- | ------------------------------- | ---------------------------------- |
| `value`   | `T`                             | The target value to test           |
| `pattern` | [`Query`](#query)\<`T`\>        | The query/pattern to match against |
| `ctx?`    | [`FinnaContext`](#finnacontext) | Optional query context             |

#### Returns

`value is T`

`true` if the value matches, `false` otherwise

#### Throws

If the query contains invalid or unregistered operators or invalid arguments.

---

### registerAllOperators()

```ts
function registerAllOperators(): () => void;
```

Registers every built-in filter operator atomically.

#### Returns

An idempotent cleanup function removing only operators installed by this call.

() => `void`

#### Throws

If a built-in name already has a different factory installed.

---

### registerArrayOperators()

```ts
function registerArrayOperators(): () => void;
```

Registers all built-in array operators atomically.

#### Returns

An idempotent cleanup function removing only operators installed by this call.

() => `void`

#### Throws

If an operator name is already registered with a different factory.

---

### registerComparisonOperators()

```ts
function registerComparisonOperators(): () => void;
```

Registers all built-in comparison operators atomically.

#### Returns

An idempotent cleanup function removing only operators installed by this call.

() => `void`

#### Throws

If an operator name is already registered with a different factory.

---

### registerDateOperators()

```ts
function registerDateOperators(): () => void;
```

Registers all built-in date operators atomically.

#### Returns

An idempotent cleanup function removing only operators installed by this call.

() => `void`

#### Throws

If an operator name is already registered with a different factory.

---

### registerElementOperators()

```ts
function registerElementOperators(): () => void;
```

Registers all built-in element operators atomically.

#### Returns

An idempotent cleanup function removing only operators installed by this call.

() => `void`

#### Throws

If an operator name is already registered with a different factory.

---

### registerEqualityOperators()

```ts
function registerEqualityOperators(): () => void;
```

Registers all built-in equality operators atomically.

#### Returns

An idempotent cleanup function removing only operators installed by this call.

() => `void`

#### Throws

If an operator name is already registered with a different factory.

---

### registerOperator()

```ts
function registerOperator(operator, factory, options?): () => void;
```

Registers one filter operator; identical registrations are no-ops.

#### Parameters

| Parameter          | Type                                  | Description                                                                |
| ------------------ | ------------------------------------- | -------------------------------------------------------------------------- |
| `operator`         | `` `$${string}` ``                    | A nonempty dollar-prefixed operator name.                                  |
| `factory`          | [`OperatorFactory`](#operatorfactory) | The function compiling an argument into a predicate.                       |
| `options`          | \{ `replace?`: `boolean`; \}          | Registration options; replacement is disabled by default.                  |
| `options.replace?` | `boolean`                             | Whether to replace a different factory already registered under this name. |

#### Returns

An idempotent cleanup function that removes this installation without restoring a replaced factory.

() => `void`

#### Throws

If the name or factory is invalid.

#### Throws

If a different factory is already installed and replacement is disabled.

---

### registerOperators()

```ts
function registerOperators(entries, options?): () => void;
```

Registers a batch atomically; identical registrations are no-ops.

#### Parameters

| Parameter          | Type                                                                                 | Description                                                                  |
| ------------------ | ------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------- |
| `entries`          | `Iterable`\<readonly \[`` `$${string}` ``, [`OperatorFactory`](#operatorfactory)\]\> | An iterable of dollar-prefixed operator names and their predicate factories. |
| `options`          | \{ `replace?`: `boolean`; \}                                                         | Registration options; replacement is disabled by default.                    |
| `options.replace?` | `boolean`                                                                            | Whether conflicting factories may be replaced, including within the batch.   |

#### Returns

An idempotent cleanup function that removes only this batch's installations, preserving later replacements.

() => `void`

#### Throws

If a name or factory is invalid.

#### Throws

If conflicting factories are found and replacement is disabled.

---

### registerStringOperators()

```ts
function registerStringOperators(): () => void;
```

Registers all built-in string operators atomically.

#### Returns

An idempotent cleanup function removing only operators installed by this call.

() => `void`

#### Throws

If an operator name is already registered with a different factory.

---

### resolveValue()

```ts
function resolveValue(value, root?): any;
```

Resolves a value, which could be a literal or a field reference.

#### Parameters

| Parameter | Type  | Description                     |
| --------- | ----- | ------------------------------- |
| `value`   | `any` | Value to resolve                |
| `root?`   | `any` | Root value for field resolution |

#### Returns

`any`

The referenced root field, undefined if unavailable, or the unchanged literal value.

---

### unregisterOperator()

```ts
function unregisterOperator(operator): boolean;
```

Removes a registered filter operator by name.

#### Parameters

| Parameter  | Type               | Description                         |
| ---------- | ------------------ | ----------------------------------- |
| `operator` | `` `$${string}` `` | The dollar-prefixed name to remove. |

#### Returns

`boolean`

True if an installed operator was removed; otherwise false.
