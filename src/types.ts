/**
 * Sortable types for comparison operators ($gt, $lt, etc.)
 */
export type Sortable = string | number | Date;

/**
 * Reference to another field in the same root value.
 */
export interface FieldReference {
  $field: string;
}

/**
 * Equality operators.
 */
export interface EqualityOperators<T> {
  /** Equality operator */
  $eq?: T | FieldReference;
  /** Inequality operator */
  $ne?: T | FieldReference;
  /** In operator */
  $in?: T[];
  /** Not in operator */
  $nin?: T[];
}

/**
 * Supported equality operators.
 */
export type EqualityOperator = keyof EqualityOperators<any>;

/**
 * Combined comparison operators for sortable types.
 */
export interface ComparisonOperators<T> {
  $gt?: T | FieldReference;
  /** Greater than or equal to operator */
  $gte?: T | FieldReference;
  /** Less than operator */
  $lt?: T | FieldReference;
  /** Less than or equal to operator */
  $lte?: T | FieldReference;
}

/**
 * Supported comparison operators.
 */
export type ComparisonOperator = keyof ComparisonOperators<any>;

/**
 * String-specific query operators.
 */
export interface StringOperators {
  /** Regular expression match */
  $regex?: string | RegExp;
  /** Starts with string */
  $startsWith?: string | FieldReference;
  /** Ends with string */
  $endsWith?: string | FieldReference;
  /** Includes substring */
  $includes?: string | FieldReference;
}

/**
 * Supported string operators.
 */
export type StringOperator = keyof StringOperators;

/**
 * Type strings supported by $type operator.
 */
export type TypeString = "string" | "number" | "boolean" | "array" | "object" | "null" | "undefined" | "date";

/**
 * Element-specific query operators.
 */
export interface ElementOperators {
  /** Check if property exists in root value */
  $exists?: boolean;
  /** Check property type */
  $type?: TypeString;
}

/**
 * Supported element operators.
 */
export type ElementOperator = keyof ElementOperators;

/**
 * Date-specific query operators.
 */
export interface DateOperators {
  /** Year operator */
  $year?: number | OperatorQuery<number>;
  /** Month operator (0-11) */
  $month?: number | OperatorQuery<number>;
  /** Day of month operator (1-31) */
  $date?: number | OperatorQuery<number>;
  /** Day of week operator (0-6, 0 is Sunday) */
  $weekday?: number | OperatorQuery<number>;
  /** Hour operator (0-23) */
  $hour?: number | OperatorQuery<number>;
  /** Minute operator (0-59) */
  $minute?: number | OperatorQuery<number>;
  /** Second operator (0-59) */
  $second?: number | OperatorQuery<number>;
  /** Millisecond operator (0-999) */
  $ms?: number | OperatorQuery<number>;
  /** Switch to UTC context for nested date operators */
  $utc?: DateOperators;
}

/**
 * Supported date operators.
 */
export type DateOperator = keyof DateOperators;

/**
 * Array-specific query operators.
 */
export interface ArrayOperators<T> {
  /** Must contain all specified values or match sub-query */
  $all?: T[] | QueryValue<T> | (T extends object ? Query<T> : never);
  /** Must contain at least one of the specified values or match sub-query */
  $some?: T[] | QueryValue<T> | (T extends object ? Query<T> : never);
  /** Must not contain any of the specified values or match sub-query */
  $none?: T[] | QueryValue<T> | (T extends object ? Query<T> : never);
  /** Size of the array */
  $size?: number | OperatorQuery<number>;
}

/**
 * Supported array operators.
 */
export type ArrayOperator = keyof ArrayOperators<any>;

/**
 * Logical operators for combining queries.
 */
export interface LogicalOperators<T> {
  /** Logical AND operator */
  $and?: Query<T>[];
  /** Logical OR operator */
  $or?: Query<T>[];
  /** Logical NOT operator */
  $not?: Query<T>;
  /** Logical NOR operator */
  $nor?: Query<T>[];
}

/**
 * Supported operator strings for internal matching logic.
 */
export type LogicalOperator = keyof LogicalOperators<any>;

/**
 * Full operator query for a value.
 */
export type OperatorQuery<T> = EqualityOperators<T> &
  ElementOperators &
  (T extends Sortable ? ComparisonOperators<T> : object) &
  (T extends string ? StringOperators : object) &
  (T extends Date ? DateOperators : object) &
  (T extends Array<infer I> ? ArrayOperators<I> : object);

/**
 * A query value can be a literal, an operator object, or a RegExp (for strings).
 */
export type QueryValue<T> = T | OperatorQuery<T> | FieldReference | (T extends string ? RegExp : never);

/**
 * Recursively define Query type.
 * Supports top-level keys of T and arbitrary string paths (dotted notation).
 */
export type Query<T> = {
  [K in keyof T]?: QueryValue<T[K]> | (T[K] extends object ? Query<T[K]> : never);
} & LogicalOperators<T> & {
    [path: string]: any;
  };

/**
 * Context for a predicate execution.
 */
export interface FinnaContext extends Record<string, any> {
  /** Whether to use UTC for date-related comparisons */
  useUTC: boolean;
  /** Set of warnings generated during query compilation */
  warnings: Set<string>;
}

/**
 * Supported query operators.
 */
export type QueryOperator =
  | EqualityOperator
  | ComparisonOperator
  | StringOperator
  | DateOperator
  | ArrayOperator
  | ElementOperator;

/**
 * Function that determines whether an operator string matches an operator group.
 *
 * @param {string} operator - Operator string to test
 * @returns {boolean} True if operator belongs to the group
 */
export type OperatorStringMatchesFn = (operator: string) => boolean;

/**
 * Function that creates a predicate for an operator.
 *
 * @param {any} operator - The operator string
 * @param {any} expected - The expected value or nested filter
 * @param {FinnaContext} context - Query context
 * @returns {Predicate} Predicate function
 */
export type OperatorRegisterFn = (operator: any, expected: any, context: FinnaContext) => Predicate;

/**
 * Tuple representation of an operator group: [matchesFn, registerFn].
 */
export type OperatorGroupTuple = [OperatorStringMatchesFn, OperatorRegisterFn];

/**
 * A predicate function that takes a value and returns true if it matches.
 *
 * @template T - Type of the value to test
 *
 * @callback Predicate
 * @param {T} val - The value to test
 * @param {any} root - The root value for field comparisons
 * @returns {boolean} `true` if matched, `false` otherwise
 */
export type Predicate<T = any> = (val: T, root?: any) => boolean;
