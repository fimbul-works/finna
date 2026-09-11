import { createPredicate, createQueryContext } from "../predicate.js";
import type { DateOperator, Predicate, QueryContext } from "../types.js";

/**
 * Creates a predicate for date operators.
 *
 * @template T - Type of the value to compare
 *
 * @param {DateOperator} operator - The date operator (e.g. '$year', '$month', '$utc')
 * @param {any} expected - The expected value or nested date filter
 * @param {QueryContext | boolean} [ctxOrUTC=false] - Query context or useUTC flag
 * @returns {Predicate<T>} A predicate function for the date operator
 */
export function createDatePredicate<T = any>(
  operator: DateOperator,
  expected: any,
  ctxOrUTC: QueryContext | boolean = false,
): Predicate<T> {
  const context =
    typeof ctxOrUTC === "boolean" ? createQueryContext(ctxOrUTC) : (ctxOrUTC ?? createQueryContext(false));

  const { useUTC } = context;

  // $utc is a context modifier
  if (operator === "$utc") {
    // Note: The caller (createOperatorPredicate) should have already handled the context switch
    // but we support it here as well for robustness if called directly.
    const innerContext = context.useUTC ? context : { ...context, useUTC: true };
    const contextPredicate = createPredicate(expected, innerContext);
    return (actual: any) => contextPredicate(actual);
  }

  const innerPredicate =
    typeof expected === "number" ? (v: number) => v === expected : createPredicate(expected, context);

  return (actual: any) => {
    let date: Date;
    if (actual instanceof Date || Object.prototype.toString.call(actual) === "[object Date]") {
      date = actual as Date;
    } else if (typeof actual === "number") {
      date = new Date(actual);
      if (Number.isNaN(date.getTime())) {
        context.warnings.add(`Invalid timestamp provided to ${operator}: ${actual}`);
        return false;
      }
    } else {
      if (actual !== null && actual !== undefined) {
        context.warnings.add(`Operator ${operator} used on non-date type: ${typeof actual}`);
      }
      return false;
    }

    let value: number;
    switch (operator) {
      case "$year":
        value = useUTC ? date.getUTCFullYear() : date.getFullYear();
        break;
      case "$month":
        value = useUTC ? date.getUTCMonth() : date.getMonth();
        break;
      case "$date":
        value = useUTC ? date.getUTCDate() : date.getDate();
        break;
      case "$weekday":
        value = useUTC ? date.getUTCDay() : date.getDay();
        break;
      case "$hour":
        value = useUTC ? date.getUTCHours() : date.getHours();
        break;
      case "$minute":
        value = useUTC ? date.getUTCMinutes() : date.getMinutes();
        break;
      case "$second":
        value = useUTC ? date.getUTCSeconds() : date.getSeconds();
        break;
      case "$ms":
        value = useUTC ? date.getUTCMilliseconds() : date.getMilliseconds();
        break;
      default:
        return false;
    }
    return innerPredicate(value);
  };
}
