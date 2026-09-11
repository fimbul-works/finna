# @fimbul-works/random

## Interfaces

### ArrayOperators

Array-specific query operators.

#### Type Parameters

| Type Parameter |
| ------ |
| `E` |

#### Properties

| Property | Type | Description |
| ------ | ------ | ------ |
| <a id="property-all"></a> `$all?` | [`Query`](#query)\<`E`\> \| `E`[] | Must contain all specified values or match sub-query |
| <a id="property-none"></a> `$none?` | [`Query`](#query)\<`E`\> \| `E`[] | Must not contain any of the specified values or match sub-query |
| <a id="property-size"></a> `$size?` | `number` \| [`OperatorQuery`](#operatorquery)\<`number`\> | Size of the array |
| <a id="property-some"></a> `$some?` | [`Query`](#query)\<`E`\> \| `E`[] | Must contain at least one of the specified values or match sub-query |

***

### ComparisonOperators

Combined comparison operators for sortable types.

#### Type Parameters

| Type Parameter |
| ------ |
| `V` |

#### Properties

| Property | Type | Description |
| ------ | ------ | ------ |
| <a id="property-gt"></a> `$gt?` | [`FieldReference`](#fieldreference) \| `V` | - |
| <a id="property-gte"></a> `$gte?` | [`FieldReference`](#fieldreference) \| `V` | Greater than or equal to operator |
| <a id="property-lt"></a> `$lt?` | [`FieldReference`](#fieldreference) \| `V` | Less than operator |
| <a id="property-lte"></a> `$lte?` | [`FieldReference`](#fieldreference) \| `V` | Less than or equal to operator |

***

### DateOperators

Date-specific query operators.

#### Properties

| Property | Type | Description |
| ------ | ------ | ------ |
| <a id="property-date"></a> `$date?` | `number` \| [`OperatorQuery`](#operatorquery)\<`number`\> | Day of month operator (1-31) |
| <a id="property-hour"></a> `$hour?` | `number` \| [`OperatorQuery`](#operatorquery)\<`number`\> | Hour operator (0-23) |
| <a id="property-minute"></a> `$minute?` | `number` \| [`OperatorQuery`](#operatorquery)\<`number`\> | Minute operator (0-59) |
| <a id="property-month"></a> `$month?` | `number` \| [`OperatorQuery`](#operatorquery)\<`number`\> | Month operator (0-11) |
| <a id="property-ms"></a> `$ms?` | `number` \| [`OperatorQuery`](#operatorquery)\<`number`\> | Millisecond operator (0-999) |
| <a id="property-second"></a> `$second?` | `number` \| [`OperatorQuery`](#operatorquery)\<`number`\> | Second operator (0-59) |
| <a id="property-utc"></a> `$utc?` | [`DateOperators`](#dateoperators) | Switch to UTC context for nested date operators |
| <a id="property-weekday"></a> `$weekday?` | `number` \| [`OperatorQuery`](#operatorquery)\<`number`\> | Day of week operator (0-6, 0 is Sunday) |
| <a id="property-year"></a> `$year?` | `number` \| [`OperatorQuery`](#operatorquery)\<`number`\> | Year operator |

***

### ElementOperators

Element-specific query operators.

#### Properties

| Property | Type | Description |
| ------ | ------ | ------ |
| <a id="property-exists"></a> `$exists?` | `boolean` | Check if property exists in root value |
| <a id="property-type"></a> `$type?` | [`TypeString`](#typestring) | Check property type |

***

### EqualityOperators

Equality operators.

#### Type Parameters

| Type Parameter |
| ------ |
| `V` |

#### Properties

| Property | Type | Description |
| ------ | ------ | ------ |
| <a id="property-eq"></a> `$eq?` | [`FieldReference`](#fieldreference) \| `V` | Equality operator |
| <a id="property-in"></a> `$in?` | `V`[] | In operator |
| <a id="property-ne"></a> `$ne?` | [`FieldReference`](#fieldreference) \| `V` | Inequality operator |
| <a id="property-nin"></a> `$nin?` | `V`[] | Not in operator |

***

### FieldReference

Reference to another field in the same root value.

#### Properties

| Property | Type |
| ------ | ------ |
| <a id="property-field"></a> `$field` | `string` |

***

### LogicalOperators

Logical operators for combining queries.

#### Type Parameters

| Type Parameter |
| ------ |
| `V` |

#### Properties

| Property | Type | Description |
| ------ | ------ | ------ |
| <a id="property-and"></a> `$and?` | [`Query`](#query)\<`V`\>[] | Logical AND operator |
| <a id="property-nor"></a> `$nor?` | [`Query`](#query)\<`V`\>[] | Logical NOR operator |
| <a id="property-not"></a> `$not?` | [`Query`](#query)\<`V`\> | Logical NOT operator |
| <a id="property-or"></a> `$or?` | [`Query`](#query)\<`V`\>[] | Logical OR operator |

***

### QueryContext

Context for a query execution.

#### Extends

- `Record`\<`string`, `any`\>

#### Indexable

```ts
[key: string]: any
```

#### Properties

| Property | Type | Description |
| ------ | ------ | ------ |
| <a id="property-useutc"></a> `useUTC` | `boolean` | Whether to use UTC for date-related comparisons |
| <a id="property-warnings"></a> `warnings` | `Set`\<`string`\> | Set of warnings generated during query compilation |

***

### QueryOptions

Options for query execution.

#### Properties

| Property | Type | Description |
| ------ | ------ | ------ |
| <a id="property-limit"></a> `$limit?` | `number` | Maximum number of matches to return |
| <a id="property-skip"></a> `$skip?` | `number` | Number of matches to skip |
| <a id="property-sort"></a> `$sort?` | `Record`\<`string`, [`SortOrder`](#sortorder)\> | Map of field paths to sort order |

***

### StringOperators

String-specific query operators.

#### Properties

| Property | Type | Description |
| ------ | ------ | ------ |
| <a id="property-endswith"></a> `$endsWith?` | `string` \| [`FieldReference`](#fieldreference) | Ends with string |
| <a id="property-includes"></a> `$includes?` | `string` \| [`FieldReference`](#fieldreference) | Includes substring |
| <a id="property-regex"></a> `$regex?` | `string` \| `RegExp` | Regular expression match |
| <a id="property-startswith"></a> `$startsWith?` | `string` \| [`FieldReference`](#fieldreference) | Starts with string |

## Type Aliases

### ArrayOperator

```ts
type ArrayOperator = keyof ArrayOperators<any>;
```

Supported array operators.

***

### ComparisonOperator

```ts
type ComparisonOperator = keyof ComparisonOperators<any>;
```

Supported comparison operators.

***

### DateOperator

```ts
type DateOperator = keyof DateOperators;
```

Supported date operators.

***

### ElementOperator

```ts
type ElementOperator = keyof ElementOperators;
```

Supported element operators.

***

### EqualityOperator

```ts
type EqualityOperator = keyof EqualityOperators<any>;
```

Supported equality operators.

***

### LogicalOperator

```ts
type LogicalOperator = keyof LogicalOperators<any>;
```

Supported operator strings for internal matching logic.

***

### OperatorQuery

```ts
type OperatorQuery<V> = EqualityOperators<V> & ElementOperators & V extends Sortable ? ComparisonOperators<V> : object & V extends string ? StringOperators : object & V extends Date ? DateOperators : object & V extends infer E[] ? ArrayOperators<E> : object;
```

Full operator query for a value.

#### Type Parameters

| Type Parameter |
| ------ |
| `V` |

***

### Predicate

```ts
type Predicate<T> = (val, root?) => boolean;
```

A predicate function that takes a value and returns true if it matches.

#### Type Parameters

| Type Parameter | Default type | Description |
| ------ | ------ | ------ |
| `T` | `any` | Type of the value to test |

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `val` | `T` | The value to test |
| `root?` | `any` | The root value for field comparisons |

#### Returns

`boolean`

`true` if matched, `false` otherwise

***

### Query

```ts
type Query<T> = { [P in keyof T]?: QueryValue<T[P]> | (T[P] extends object ? Query<T[P]> : never) } & LogicalOperators<T> & {
[path: string]: any;
};
```

Recursively define Query type.
Supports top-level keys of T and arbitrary string paths (dotted notation).

#### Type Parameters

| Type Parameter |
| ------ |
| `T` |

***

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

***

### QueryValue

```ts
type QueryValue<V> = 
  | V
  | OperatorQuery<V>
  | FieldReference
  | V extends string ? RegExp : never;
```

A query value can be a literal, an operator object, or a RegExp (for strings).

#### Type Parameters

| Type Parameter |
| ------ |
| `V` |

***

### Sortable

```ts
type Sortable = string | number | Date;
```

Sortable types for comparison operators ($gt, $lt, etc.)

***

### SortOrder

```ts
type SortOrder = 1 | -1;
```

Sort order: 1 for ascending, -1 for descending.

***

### StringOperator

```ts
type StringOperator = keyof StringOperators;
```

Supported string operators.

***

### TypeString

```ts
type TypeString = 
  | "string"
  | "number"
  | "boolean"
  | "array"
  | "object"
  | "null"
  | "undefined"
  | "date";
```

Type strings supported by $type operator.

## Functions

### createArrayPredicate()

```ts
function createArrayPredicate<T>(
   operator, 
   expected, 
   ctx
): Predicate<T>;
```

Creates a predicate for array operators.

#### Type Parameters

| Type Parameter | Default type | Description |
| ------ | ------ | ------ |
| `T` | `any` | Type of the value to compare |

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `operator` | keyof [`ArrayOperators`](#arrayoperators)\<`any`\> | The array operator (e.g. '$all', '$some', '$none', '$size') |
| `expected` | `any` | The expected values or nested filter for size |
| `ctx` | [`QueryContext`](#querycontext) | Query context |

#### Returns

[`Predicate`](#predicate)\<`T`\>

A predicate function for the array operator

***

### createComparisonPredicate()

```ts
function createComparisonPredicate<T>(
   operator, 
   expected, 
   _ctx
): Predicate<T>;
```

Creates a predicate for comparison operators.

#### Type Parameters

| Type Parameter | Default type | Description |
| ------ | ------ | ------ |
| `T` | `any` | Type of the value to compare |

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `operator` | keyof [`ComparisonOperators`](#comparisonoperators)\<`any`\> | The comparison operator (e.g. '$gt', '$gte', '$lt', '$lte') |
| `expected` | `any` | The expected value |
| `_ctx` | [`QueryContext`](#querycontext) | Query context |

#### Returns

[`Predicate`](#predicate)\<`T`\>

A predicate function for the comparison operator

***

### createDatePredicate()

```ts
function createDatePredicate<T>(
   operator, 
   expected, 
   ctxOrUTC?
): Predicate<T>;
```

Creates a predicate for date operators.

#### Type Parameters

| Type Parameter | Default type | Description |
| ------ | ------ | ------ |
| `T` | `any` | Type of the value to compare |

#### Parameters

| Parameter | Type | Default value | Description |
| ------ | ------ | ------ | ------ |
| `operator` | keyof [`DateOperators`](#dateoperators) | `undefined` | The date operator (e.g. '$year', '$month', '$utc') |
| `expected` | `any` | `undefined` | The expected value or nested date filter |
| `ctxOrUTC?` | `boolean` \| [`QueryContext`](#querycontext) | `false` | Query context or useUTC flag |

#### Returns

[`Predicate`](#predicate)\<`T`\>

A predicate function for the date operator

***

### createEqualityPredicate()

```ts
function createEqualityPredicate<T>(
   operator, 
   expected, 
   ctx
): Predicate<T>;
```

Creates a predicate for equality operators.

#### Type Parameters

| Type Parameter | Default type | Description |
| ------ | ------ | ------ |
| `T` | `any` | Type of the value to compare |

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `operator` | keyof [`EqualityOperators`](#equalityoperators)\<`any`\> | The equality operator (e.g. '$eq', '$ne', '$in', '$nin') |
| `expected` | `any` | The expected value or array of values |
| `ctx` | [`QueryContext`](#querycontext) | Query context |

#### Returns

[`Predicate`](#predicate)\<`T`\>

A predicate function for the equality operator

***

### createMatcher()

```ts
function createMatcher<T>(query, contextOrUTC?): Predicate<T>;
```

Creates a matcher function for the given query.
The returned function can be used to test values efficiently.

#### Type Parameters

| Type Parameter | Description |
| ------ | ------ |
| `T` *extends* `Record`\<`string`, `any`\> | Type to check |

#### Parameters

| Parameter | Type | Default value | Description |
| ------ | ------ | ------ | ------ |
| `query` | [`Query`](#query)\<`T`\> | `undefined` | The query to compile into a matcher |
| `contextOrUTC?` | `boolean` \| [`QueryContext`](#querycontext) | `false` | Query context or useUTC flag |

#### Returns

[`Predicate`](#predicate)\<`T`\>

A matcher function

***

### createPredicate()

```ts
function createPredicate<T>(filter, contextOrUTC?): Predicate<T>;
```

Create a predicate function from a query value.

#### Type Parameters

| Type Parameter | Default type | Description |
| ------ | ------ | ------ |
| `T` | `any` | Type of the value to test |

#### Parameters

| Parameter | Type | Default value | Description |
| ------ | ------ | ------ | ------ |
| `filter` | `any` | `undefined` | The query filter to create a predicate for |
| `contextOrUTC?` | `boolean` \| [`QueryContext`](#querycontext) | `false` | Connection context or useUTC flag |

#### Returns

[`Predicate`](#predicate)\<`T`\>

A predicate function for the given filter

***

### createQueryContext()

```ts
function createQueryContext(useUTC?): QueryContext;
```

Creates a new query context.

#### Parameters

| Parameter | Type | Default value |
| ------ | ------ | ------ |
| `useUTC` | `boolean` | `false` |

#### Returns

[`QueryContext`](#querycontext)

***

### createStringPredicate()

```ts
function createStringPredicate<T>(
   operator, 
   expected, 
   _ctx
): Predicate<T>;
```

Creates a predicate for string operators.

#### Type Parameters

| Type Parameter | Default type | Description |
| ------ | ------ | ------ |
| `T` | `any` | Type of the value to compare |

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `operator` | keyof [`StringOperators`](#stringoperators) | The string operator (e.g. '$regex', '$startsWith', '$endsWith', '$includes') |
| `expected` | `any` | The expected value or regex |
| `_ctx` | [`QueryContext`](#querycontext) | Query context |

#### Returns

[`Predicate`](#predicate)\<`T`\>

A predicate function for the string operator

***

### isDeepEqual()

```ts
function isDeepEqual(a, b): boolean;
```

Performs a deep equality check between two values.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `a` | `any` | First value |
| `b` | `any` | Second value |

#### Returns

`boolean`

`true` if values are deeply equal, `false` otherwise

***

### isObject()

```ts
function isObject<T>(value): value is T;
```

Check if a value is an object.

#### Type Parameters

| Type Parameter | Default type |
| ------ | ------ |
| `T` *extends* `object` | `object` |

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `value` | `any` | The value to check |

#### Returns

`value is T`

`true` if the value is an object, `false` otherwise

***

### isOperatorObject()

```ts
function isOperatorObject(val): val is Record<string, any>;
```

Checks if a value is an operator object (all keys start with $).

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `val` | `any` | Value to check |

#### Returns

`val is Record<string, any>`

`true` if it's an operator object, `false` otherwise

***

### matches()

```ts
function matches<T>(value, query): boolean;
```

Checks if the given query matches.

#### Type Parameters

| Type Parameter | Description |
| ------ | ------ |
| `T` *extends* `Record`\<`string`, `any`\> | Type to check |

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `value` | `T` | The value to check |
| `query` | [`Query`](#query)\<`T`\> | The query to match against |

#### Returns

`boolean`

`true` if the value matches, `false` otherwise

***

### resolveValue()

```ts
function resolveValue(value, root?): any;
```

Resolves a value, which could be a literal or a field reference.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `value` | `any` | Value to resolve |
| `root?` | `any` | Root value for field resolution |

#### Returns

`any`

Resolved value
