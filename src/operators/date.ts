import {
  QUERY_DATE,
  QUERY_HOUR,
  QUERY_MINUTE,
  QUERY_MONTH,
  QUERY_MS,
  QUERY_SECOND,
  QUERY_UTC,
  QUERY_WEEKDAY,
  QUERY_YEAR,
} from "../constants.js";
import { createPredicate } from "../predicate.js";
import { registerOperators } from "../operator-registry.js";
import type { DateOperator, Predicate, QueryContext } from "../types.js";

/**
 * Creates a predicate for date operators.
 *
 * @template T - Type of the value to compare
 *
 * @param {DateOperator} operator - The date operator (e.g. '$year', '$month', '$utc')
 * @param {any} expected - The expected value or nested date filter
 * @param {QueryContext | boolean} [ctx=false] - Query context or useUTC flag
 * @returns {Predicate<T>} A predicate function for the date operator
 */
export function createDatePredicate<T = any>(operator: DateOperator, expected: any, ctx: QueryContext): Predicate<T> {
  const { useUTC } = ctx;

  // $utc is a context modifier
  if (operator === QUERY_UTC) {
    const predicate = createPredicate(expected, { ...ctx, useUTC: true });
    return (actual: any) => predicate(actual);
  }

  const predicate = typeof expected === "number" ? (v: number) => v === expected : createPredicate(expected, ctx);

  return (actual: any) => {
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
      case QUERY_YEAR:
        value = useUTC ? date.getUTCFullYear() : date.getFullYear();
        break;
      case QUERY_MONTH:
        value = useUTC ? date.getUTCMonth() : date.getMonth();
        break;
      case QUERY_DATE:
        value = useUTC ? date.getUTCDate() : date.getDate();
        break;
      case QUERY_WEEKDAY:
        value = useUTC ? date.getUTCDay() : date.getDay();
        break;
      case QUERY_HOUR:
        value = useUTC ? date.getUTCHours() : date.getHours();
        break;
      case QUERY_MINUTE:
        value = useUTC ? date.getUTCMinutes() : date.getMinutes();
        break;
      case QUERY_SECOND:
        value = useUTC ? date.getUTCSeconds() : date.getSeconds();
        break;
      case QUERY_MS:
        value = useUTC ? date.getUTCMilliseconds() : date.getMilliseconds();
        break;
      default:
        throw new Error(`Invalid date query operator: ${operator}`);
    }

    return predicate(value);
  };
}

/**
 * Checks whether an operator is a date operator.
 *
 * @param {string} op - Operator string to test
 * @returns {boolean} `true` if it's a date operator
 */
const isDateOperator = (op: string): op is DateOperator =>
  op === QUERY_YEAR ||
  op === QUERY_MONTH ||
  op === QUERY_DATE ||
  op === QUERY_WEEKDAY ||
  op === QUERY_HOUR ||
  op === QUERY_MINUTE ||
  op === QUERY_SECOND ||
  op === QUERY_MS ||
  op === QUERY_UTC;

/**
 * Registers date operators into the query engine.
 *
 * @returns {() => void} Unregister function
 */
export const registerDateOperators = (): (() => void) => registerOperators([isDateOperator, createDatePredicate]);
