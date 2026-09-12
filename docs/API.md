# @fimbul-works/query

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
| <a id="property-all"></a> `$all?` | \| [`QueryValue`](#queryvalue)\<`E`\> \| `E`[] \| `E` *extends* `object` ? [`Query`](#query)\<`E`\> : `never` | Must contain all specified values or match sub-query |
| <a id="property-none"></a> `$none?` | \| [`QueryValue`](#queryvalue)\<`E`\> \| `E`[] \| `E` *extends* `object` ? [`Query`](#query)\<`E`\> : `never` | Must not contain any of the specified values or match sub-query |
| <a id="property-size"></a> `$size?` | `number` \| [`OperatorQuery`](#operatorquery)\<`number`\> | Size of the array |
| <a id="property-some"></a> `$some?` | \| [`QueryValue`](#queryvalue)\<`E`\> \| `E`[] \| `E` *extends* `object` ? [`Query`](#query)\<`E`\> : `never` | Must contain at least one of the specified values or match sub-query |

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

### OperatorGroupTuple

```ts
type OperatorGroupTuple = [OperatorStringMatchesFn, OperatorRegisterFn];
```

Tuple representation of an operator group: [matchesFn, registerFn].

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

### OperatorRegisterFn

```ts
type OperatorRegisterFn = (operator, expected, context) => Predicate;
```

Function that creates a predicate for an operator.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `operator` | `any` | The operator string |
| `expected` | `any` | The expected value or nested filter |
| `context` | [`QueryContext`](#querycontext) | Query context |

#### Returns

[`Predicate`](#predicate)

Predicate function

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

### compileQuery()

```ts
function compileQuery<T>(query, ctx?): Predicate<T>;
```

Compiles a predicate function from a query object.
The returned function can be used to test values efficiently.

#### Type Parameters

| Type Parameter | Description |
| ------ | ------ |
| `T` *extends* `Record`\<`string`, `any`\> | Type to check |

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `query` | [`Query`](#query)\<`T`\> | The query to compile into a matcher |
| `ctx?` | [`QueryContext`](#querycontext) | Optional query context |

#### Returns

[`Predicate`](#predicate)\<`T`\>

A query predicate function

***

### createPredicate()

```ts
function createPredicate<T>(filter, ctx?): Predicate<T>;
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
| `ctx?` | [`QueryContext`](#querycontext) | Optional query context |

#### Returns

[`Predicate`](#predicate)\<`T`\>

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

### query()

```ts
function query<T>(
   value, 
   q, 
   ctx?
): value is T;
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
| `q` | [`Query`](#query)\<`T`\> | The query to match against |
| `ctx?` | [`QueryContext`](#querycontext) | Optional query context |

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
