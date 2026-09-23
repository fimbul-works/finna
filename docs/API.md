# <img src="../finna-logo.svg" alt="Finna" style="height:200px;"/>

## Interfaces

### ArrayOperators

Array-specific query operators.

#### Type Parameters

| Type Parameter |
| ------ |
| `T` |

#### Properties

| Property | Type | Description |
| ------ | ------ | ------ |
| <a id="property-all"></a> `$all?` | \| [`QueryValue`](#queryvalue)\<`T`\> \| `T`[] \| `T` *extends* `object` ? [`Query`](#query)\<`T`\> : `never` | Must contain all specified values or match sub-query |
| <a id="property-none"></a> `$none?` | \| [`QueryValue`](#queryvalue)\<`T`\> \| `T`[] \| `T` *extends* `object` ? [`Query`](#query)\<`T`\> : `never` | Must not contain any of the specified values or match sub-query |
| <a id="property-size"></a> `$size?` | \| `number` \| [`OperatorQuery`](#operatorquery)\<`number`\> \| [`FilterPredicate`](#filterpredicate)\<`number`\> | Size of the array |
| <a id="property-some"></a> `$some?` | \| [`QueryValue`](#queryvalue)\<`T`\> \| `T`[] \| `T` *extends* `object` ? [`Query`](#query)\<`T`\> : `never` | Must contain at least one of the specified values or match sub-query |

***

### ComparisonOperators

Combined comparison operators for sortable types.

#### Type Parameters

| Type Parameter |
| ------ |
| `T` |

#### Properties

| Property | Type | Description |
| ------ | ------ | ------ |
| <a id="property-gt"></a> `$gt?` | [`FieldReference`](#fieldreference) \| `T` | - |
| <a id="property-gte"></a> `$gte?` | [`FieldReference`](#fieldreference) \| `T` | Greater than or equal to operator |
| <a id="property-lt"></a> `$lt?` | [`FieldReference`](#fieldreference) \| `T` | Less than operator |
| <a id="property-lte"></a> `$lte?` | [`FieldReference`](#fieldreference) \| `T` | Less than or equal to operator |

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
| `T` |

#### Properties

| Property | Type | Description |
| ------ | ------ | ------ |
| <a id="property-eq"></a> `$eq?` | [`FieldReference`](#fieldreference) \| `T` | Equality operator |
| <a id="property-in"></a> `$in?` | `T`[] | In operator |
| <a id="property-ne"></a> `$ne?` | [`FieldReference`](#fieldreference) \| `T` | Inequality operator |
| <a id="property-nin"></a> `$nin?` | `T`[] | Not in operator |

***

### FieldReference

Reference to another field in the same root value.

#### Properties

| Property | Type |
| ------ | ------ |
| <a id="property-field"></a> `$field` | `string` |

***

### FinnaContext

Context for a predicate execution.

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

### LogicalOperators

Logical operators for combining queries.

#### Type Parameters

| Type Parameter |
| ------ |
| `T` |

#### Properties

| Property | Type | Description |
| ------ | ------ | ------ |
| <a id="property-and"></a> `$and?` | [`Query`](#query)\<`T`\>[] | Logical AND operator |
| <a id="property-nor"></a> `$nor?` | [`Query`](#query)\<`T`\>[] | Logical NOR operator |
| <a id="property-not"></a> `$not?` | [`Query`](#query)\<`T`\> | Logical NOT operator |
| <a id="property-or"></a> `$or?` | [`Query`](#query)\<`T`\>[] | Logical OR operator |

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

### FilterPredicate

```ts
type FilterPredicate<T> = (val, root?) => val is T;
```

A filter predicate function that receives the value and the root value.

#### Type Parameters

| Type Parameter | Default type | Description |
| ------ | ------ | ------ |
| `T` | `any` | Type of the value to test |

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `val` | `any` | The value to test |
| `root?` | `any` | The root value for field comparisons |

#### Returns

`val is T`

True if matched, false otherwise

***

### LogicalOperator

```ts
type LogicalOperator = keyof LogicalOperators<any>;
```

Supported operator strings for internal matching logic.

***

### OperatorGroupTuple

```ts
type OperatorGroupTuple = [OperatorStringMatchesFn, OperatorRegisterFn];
```

Tuple representation of an operator group: [matchesFn, registerFn].

***

### OperatorQuery

```ts
type OperatorQuery<T> = EqualityOperators<T> & ElementOperators & T extends Sortable ? ComparisonOperators<T> : object & T extends string ? StringOperators : object & T extends Date ? DateOperators : object & T extends infer I[] ? ArrayOperators<I> : object;
```

Full operator query for a value.

#### Type Parameters

| Type Parameter |
| ------ |
| `T` |

***

### OperatorRegisterFn

```ts
type OperatorRegisterFn = (operator, expected, context) => FilterPredicate;
```

Function that creates a predicate for an operator.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `operator` | `any` | The operator string |
| `expected` | `any` | The expected value or nested filter |
| `context` | [`FinnaContext`](#finnacontext) | Query context |

#### Returns

[`FilterPredicate`](#filterpredicate)

FilterPredicate function

***

### OperatorStringMatchesFn

```ts
type OperatorStringMatchesFn = (operator) => boolean;
```

Function that determines whether an operator string matches an operator group.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `operator` | `string` | Operator string to test |

#### Returns

`boolean`

True if operator belongs to the group

***

### Query

```ts
type Query<T> = 
  | QueryObject<T>
| FilterPredicate<T>;
```

Recursively define Query type.
A query can be an object query specification or a filter predicate function.
Supports top-level keys of T, arbitrary string paths (dotted notation), and root-level predicate functions.

#### Type Parameters

| Type Parameter |
| ------ |
| `T` |

***

### QueryObject

```ts
type QueryObject<T> = { [K in keyof T]?: QueryValue<T[K]> | (T[K] extends object ? Query<T[K]> : never) } & LogicalOperators<T> & {
[path: string]: any;
};
```

Object-based query specification for a type T.

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
type QueryValue<T> = 
  | T
  | OperatorQuery<T>
  | FieldReference
  | T extends string ? RegExp : never
| FilterPredicate<T>;
```

A query value can be a literal, an operator object, a RegExp (for strings), or a filter predicate function.

#### Type Parameters

| Type Parameter |
| ------ |
| `T` |

***

### Sortable

```ts
type Sortable = string | number | Date;
```

Sortable types for comparison operators ($gt, $lt, etc.)

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

### clearOperators()

```ts
function clearOperators(): void;
```

Clears all registered operator groups.

#### Returns

`void`

***

### compile()

```ts
function compile<T>(pattern, ctx?): FilterPredicate<T>;
```

Compiles a query/pattern specification into an optimized, reusable predicate function.

#### Type Parameters

| Type Parameter | Description |
| ------ | ------ |
| `T` *extends* `Record`\<`string`, `any`\> | Type of value to match |

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `pattern` | [`Query`](#query)\<`T`\> | The query/pattern specification to compile |
| `ctx?` | [`FinnaContext`](#finnacontext) | Optional query context |

#### Returns

[`FilterPredicate`](#filterpredicate)\<`T`\>

A compiled predicate function `(value) => boolean`

***

### createPredicate()

```ts
function createPredicate<T>(filter, ctx?): FilterPredicate<T>;
```

Create a predicate function from a query value.

#### Type Parameters

| Type Parameter | Default type | Description |
| ------ | ------ | ------ |
| `T` | `any` | Type of the value to test |

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `filter` | `any` | The query filter to create a predicate for |
| `ctx?` | [`FinnaContext`](#finnacontext) | Optional query context |

#### Returns

[`FilterPredicate`](#filterpredicate)\<`T`\>

A predicate function for the given filter

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

### match()

```ts
function match<T>(
   value, 
   pattern, 
   ctx?
): value is T;
```

Checks if a value satisfies a query/pattern specification.

#### Type Parameters

| Type Parameter | Description |
| ------ | ------ |
| `T` *extends* `Record`\<`string`, `any`\> | Type of value to match |

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `value` | `T` | The target value to test |
| `pattern` | [`Query`](#query)\<`T`\> | The query/pattern to match against |
| `ctx?` | [`FinnaContext`](#finnacontext) | Optional query context |

#### Returns

`value is T`

`true` if the value matches, `false` otherwise

***

### registerAllOperators()

```ts
function registerAllOperators(): void;
```

Registers all built-in operator groups into the query engine.

#### Returns

`void`

***

### registerArrayOperators()

```ts
function registerArrayOperators(): () => void;
```

Registers array operators into the query engine.

#### Returns

Unregister function

() => `void`

***

### registerComparisonOperators()

```ts
function registerComparisonOperators(): () => void;
```

Registers comparison operators into the query engine.

#### Returns

Unregister function

() => `void`

***

### registerDateOperators()

```ts
function registerDateOperators(): () => void;
```

Registers date operators into the query engine.

#### Returns

Unregister function

() => `void`

***

### registerElementOperators()

```ts
function registerElementOperators(): () => void;
```

Registers element operators into the query engine.

#### Returns

Unregister function

() => `void`

***

### registerEqualityOperators()

```ts
function registerEqualityOperators(): () => void;
```

Registers equality operators into the query engine.

#### Returns

Unregister function

() => `void`

***

### registerOperators()

```ts
function registerOperators(operatorGroupTuple): () => void;
```

Registers an operator group tuple in the registry.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `operatorGroupTuple` | [`OperatorGroupTuple`](#operatorgrouptuple) | Operator group tuple to register |

#### Returns

Unregister function

() => `void`

***

### registerStringOperators()

```ts
function registerStringOperators(): () => void;
```

Registers string operators into the query engine.

#### Returns

Unregister function

() => `void`

***

### unregisterOperators()

```ts
function unregisterOperators(operatorGroupTuple): boolean;
```

Unregisters an operator group tuple from the registry.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `operatorGroupTuple` | [`OperatorGroupTuple`](#operatorgrouptuple) | Operator group tuple to unregister |

#### Returns

`boolean`

True if group was found and removed
