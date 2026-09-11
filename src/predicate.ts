import { createArrayPredicate } from "./factories/array.js";
import { createComparisonPredicate } from "./factories/comparison.js";
import { createDatePredicate } from "./factories/date.js";
import { createElementPredicate } from "./factories/element.js";
import { createEqualityPredicate } from "./factories/equality.js";
import { createStringPredicate } from "./factories/string.js";
import type {
  ArrayOperator,
  ComparisonOperator,
  DateOperator,
  ElementOperator,
  EqualityOperator,
  Predicate,
  QueryContext,
  QueryOperator,
  StringOperator,
} from "./types.js";
import { isDeepEqual, isObject, isOperatorObject } from "./util.js";

/**
 * Creates a new query context.
 */
export function createQueryContext(useUTC: boolean = false): QueryContext {
  return {
    useUTC,
    warnings: new Set<string>(),
  };
}

/**
 * Create a predicate function from a query value.
 *
 * @template T - Type of the value to test
 *
 * @param {any} filter - The query filter to create a predicate for
 * @param {QueryContext | boolean} [contextOrUTC=false] - Connection context or useUTC flag
 * @returns {Predicate<T>} A predicate function for the given filter
 */
export function createPredicate<T = any>(filter: any, contextOrUTC: QueryContext | boolean = false): Predicate<T> {
  const context =
    typeof contextOrUTC === "boolean" ? createQueryContext(contextOrUTC) : (contextOrUTC ?? createQueryContext(false));

  if (filter instanceof RegExp) {
    return (actual: any) => typeof actual === "string" && (filter as RegExp).test(actual);
  }

  if (filter instanceof Date) {
    const t = (filter as Date).getTime();
    return (actual: any) => (actual instanceof Date ? (actual as Date).getTime() === t : actual === t);
  }

  if (isOperatorObject(filter)) {
    const predicates = Object.entries(filter).map(([op, expected]) =>
      createOperatorPredicate(op as QueryOperator, expected, context),
    );
    return (actual: any, root?: any) => predicates.every((p) => p(actual, root));
  }

  if (isObject(filter) && !(filter instanceof Date) && !(filter instanceof RegExp)) {
    return (actual: any, root?: any) => {
      if (!isObject(actual) || actual instanceof Date || actual instanceof RegExp) {
        return false;
      }
      return Object.entries(filter).every(([key, subFilter]) => {
        const subPredicate = createPredicate(subFilter, context);
        return subPredicate((actual as any)[key], root);
      });
    };
  }

  return (actual: any) => isDeepEqual(actual, filter);
}

/**
 * Create a predicate for a specific operator.
 *
 * @template T
 * @param {QueryOperator} operator - The operator string (e.g. '$eq', '$gt')
 * @param {any} expected - The expected value or nested filter
 * @param {QueryContext} context - Query context
 * @returns {Predicate<T>} A predicate function for the operator
 */
function createOperatorPredicate<T = any>(operator: QueryOperator, expected: any, context: QueryContext): Predicate<T> {
  // Equality
  if (operator === "$eq" || operator === "$ne" || operator === "$in" || operator === "$nin") {
    return createEqualityPredicate(operator as EqualityOperator, expected, context);
  }

  // Comparison
  if (operator === "$gt" || operator === "$gte" || operator === "$lt" || operator === "$lte") {
    return createComparisonPredicate(operator as ComparisonOperator, expected, context);
  }

  // String
  if (operator === "$regex" || operator === "$startsWith" || operator === "$endsWith" || operator === "$includes") {
    return createStringPredicate(operator as StringOperator, expected, context);
  }

  // Element
  if (operator === "$exists" || operator === "$type") {
    return createElementPredicate(operator as ElementOperator, expected, context);
  }

  // Date
  if (
    operator === "$year" ||
    operator === "$month" ||
    operator === "$date" ||
    operator === "$weekday" ||
    operator === "$hour" ||
    operator === "$minute" ||
    operator === "$second" ||
    operator === "$ms" ||
    operator === "$utc"
  ) {
    if (operator === "$utc") {
      // Force UTC for nested
      const utcContext = { ...context, useUTC: true };
      return createDatePredicate(operator, expected, utcContext);
    }
    return createDatePredicate(operator as DateOperator, expected, context);
  }

  // Array
  if (operator === "$all" || operator === "$some" || operator === "$none" || operator === "$size") {
    return createArrayPredicate(operator as ArrayOperator, expected, context);
  }

  return () => false;
}
