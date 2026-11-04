/**
 * Sortable types for comparison operators ($gt, $lt, etc.)
 */
export type Sortable = string | number | Date;

/**
 * A filter predicate function that receives the value and the root value.
 *
 * @template T - Type of the value to test
 * @param {any} val - The value to test
 * @param {any} root - The root value for field comparisons
 * @returns {boolean} True if matched, false otherwise
 */
export type FilterPredicate<T = any> = (val: any, root?: any) => val is T;

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
  /** Test the uppercased string without mutating the document. */
  $uppercase?: QueryValue<string>;
  /** Test the lowercased string without mutating the document. */
  $lowercase?: QueryValue<string>;
  /** Replace using JavaScript replace semantics, then test the result. */
  $replace?: StringReplacement;
  /** Replace every occurrence; RegExp searches must have the global flag. */
  $replaceAll?: StringReplacement;
}

/** Arguments for a string replacement followed by a nested predicate. */
export interface StringReplacement {
  /** Literal text, a RegExp, or a reference resolved against the original root. */
  search: string | RegExp | FieldReference;
  /** Replacement text with JavaScript substitution syntax, or a root reference. */
  replace: string | FieldReference;
  /** Query applied to the replaced string, retaining the original root. */
  then: QueryValue<string>;
}

/**
 * Supported string operators.
 */
export type StringOperator = keyof StringOperators;

/**
 * Type strings supported by $type operator.
 */
export type TypeString =
  | "string"
  | "number"
  | "boolean"
  | "array"
  | "object"
  | "null"
  | "undefined"
  | "date"
  | "bigint"
  | "int"
  | "symbol"
  | "function";

/**
 * Element-specific query operators.
 */
export interface ElementOperators {
  /** Check if property exists in root value */
  $exists?: boolean;
  /** Check property type */
  $type?: TypeString;
  /** Check property truthiness */
  $truthy?: boolean;
  /** Check property falsiness */
  $falsy?: boolean;
  /** Check property nullishness (null, undefined) */
  $nullish?: boolean;
  /** Check a Hvat number (including NaN and Infinity). */
  $isNumber?: boolean;
  $isString?: boolean;
  $isInteger?: boolean;
  /** Check a Hvat object: non-null, non-array; includes class instances. */
  $isObject?: boolean;
  $isArray?: boolean;
  /** Check a Date instance, including invalid dates. */
  $isDate?: boolean;
  $isSymbol?: boolean;
  /** Check instanceof the supplied constructor, including subclasses. */
  $isClass?: abstract new (
    ...args: any[]
  ) => any;
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
  $size?: number | OperatorQuery<number> | FilterPredicate<number>;
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
 * A query value can be a literal, an operator object, a RegExp (for strings), or a filter predicate function.
 */
export type QueryValue<T> =
  | T
  | OperatorQuery<T>
  | FieldReference
  | (T extends string ? RegExp : never)
  | FilterPredicate<T>;

/**
 * Object-based query specification for a type T.
 */
export type QueryObject<T> = {
  [K in keyof T]?: QueryValue<T[K]> | (T[K] extends object ? Query<T[K]> : never);
} & LogicalOperators<T> & {
    [path: string]: any;
  };

/**
 * Recursively define Query type.
 * A query can be an object query specification or a filter predicate function.
 * Supports top-level keys of T, arbitrary string paths (dotted notation), and root-level predicate functions.
 */
export type Query<T> = QueryObject<T> | FilterPredicate<T>;

/** Where a diagnostic originated. */
export type DiagnosticPhase = "compile" | "evaluate";
/** Severity remains warning even when warningsAsErrors escalates it. */
export type DiagnosticSeverity = "error" | "warning";

/** Structured logging fields; document values are never included automatically. */
export interface FinnaLogDetails {
  err: Error;
  phase: DiagnosticPhase;
  severity: DiagnosticSeverity;
  path: readonly (string | number)[];
  operator?: OperatorName;
}

/** Structural logger interface compatible with Pino; no logger dependency is required. */
export interface FinnaLogger {
  warn(details: FinnaLogDetails, message: string): void;
  error(details: FinnaLogDetails, message: string): void;
}

/** Explicit diagnostic policy; no settings are inferred from NODE_ENV. */
export interface FinnaContextOptions {
  useUTC?: boolean;
  /** Result APIs throw by default. Strict boolean/predicate APIs always throw on failure. */
  throwErrors?: boolean;
  warningsAsErrors?: boolean;
  captureStacks?: boolean;
  logger?: FinnaLogger;
}

/** Context shared by nested queries; UTC modifiers preserve diagnostic policy. */
export interface FinnaContext extends Record<string, any> {
  useUTC: boolean;
  throwErrors: boolean;
  warningsAsErrors: boolean;
  captureStacks: boolean;
  logger?: FinnaLogger;
  /** Diagnostic history, including compilation and completed evaluations. */
  errors: Error[];
  warnings: Error[];
  path?: readonly (string | number)[];
}

/** Failed compilation never returns a partial predicate. */
export interface CompilationResult<T = any> {
  predicate: FilterPredicate<T> | null;
  context: FinnaContext;
}

/** Null distinguishes failed execution from a legitimate non-match. */
export interface EvaluationResult {
  matched: boolean | null;
  context: FinnaContext;
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
 * Compiles an operator argument into a reusable predicate.
 *
 * @param expected - The operator argument, which may contain a nested filter.
 * @param context - Compilation context providing date settings and shared diagnostics.
 * @returns The predicate used to test an actual value and optional root value.
 * @throws {Error} If the operator argument cannot be compiled.
 */
export type OperatorFactory = (expected: any, context: FinnaContext) => FilterPredicate;

/** Operator names must start with a dollar sign, including custom operators. */
export type OperatorName = `$${string}`;

/** Registry of explicitly installed filter operators. */
export type OperatorMap<Name extends OperatorName = OperatorName> = Map<Name, OperatorFactory>;
