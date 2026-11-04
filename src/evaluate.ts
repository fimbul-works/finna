import { isClass } from "@fimbul-works/hvat";
import { compileResult } from "./compile-result.js";
import { createFinnaContext } from "./context.js";
import type { EvaluationResult, FinnaContext, Query } from "./types.js";

/** Compiles and evaluates a query; null indicates failure rather than an ordinary non-match. */
export function evaluate<T extends Record<string, any>>(
  value: T,
  query: Query<T>,
  context: FinnaContext = createFinnaContext(),
): EvaluationResult {
  const { predicate } = compileResult(query, context);
  if (!predicate) return { matched: null, context };
  try {
    return { matched: predicate(value, value), context };
  } catch (error) {
    if (!isClass(error, AggregateError) || context.throwErrors) throw error;
    return { matched: null, context };
  }
}
