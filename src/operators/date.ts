import { registerOperators } from "../operator-registry.js";
import { createPredicate } from "../predicate.js";
import type { DateOperator, FilterPredicate, FinnaContext } from "../types.js";

/**
 * Creates a predicate for date operators.
 *
 * @param {DateOperator} operator - The date operator (e.g. '$year', '$month', '$utc')
 * @param {any} expected - The expected value or nested date filter
 * @param {FinnaContext | boolean} [ctx=false] - Query context or useUTC flag
 * @returns {FilterPredicate} A predicate function for the date operator
 */
export function createDatePredicate(operator: DateOperator, expected: any, ctx: FinnaContext): FilterPredicate {
  const { useUTC } = ctx;

  // $utc is a context modifier
  if (operator === "$utc") {
    const predicate = createPredicate(expected, { ...ctx, useUTC: true });
    return ((actual: any, root?: any) => predicate(actual, root)) as FilterPredicate;
  }

  const predicate: FilterPredicate =
    typeof expected === "number" ? (((v: number) => v === expected) as any) : createPredicate(expected, ctx);

  return ((actual: any, root?: any) => {
    let date: Date;
    if (actual instanceof Date) {
      date = actual;
    } else if (typeof actual === "number") {
      date = new Date(actual);
      if (Number.isNaN(date.getTime())) {
        ctx.warnings.add(`Invalid timestamp provided to ${operator}: ${actual}`);
        return false;
      }
    } else {
      if (actual !== null && actual !== undefined) {
        ctx.warnings.add(`Operator ${operator} used on non-date type: ${typeof actual}`);
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
        throw new Error(`Invalid date query operator: ${operator}`);
    }

    return predicate(value, root);
  }) as FilterPredicate;
}

/**
 * Checks whether an operator is a date operator.
 *
 * @param {string} op - Operator string to test
 * @returns {boolean} `true` if it's a date operator
 */
const isDateOperator = (op: string): op is DateOperator =>
  op === "$year" ||
  op === "$month" ||
  op === "$date" ||
  op === "$weekday" ||
  op === "$hour" ||
  op === "$minute" ||
  op === "$second" ||
  op === "$ms" ||
  op === "$utc";

/**
 * Registers date operators into the query engine.
 *
 * @returns {() => void} Unregister function
 */
export const registerDateOperators = (): (() => void) => registerOperators([isDateOperator, createDatePredicate]);
