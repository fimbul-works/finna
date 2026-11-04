import { isClass } from "@fimbul-works/hvat";
import { compile } from "./compile.js";
import { createFinnaContext } from "./context.js";
import type { CompilationResult, FinnaContext, Query } from "./types.js";

/** Compiles with diagnostics; throwErrors=false returns a null predicate on failure. */
export function compileResult<T extends Record<string, any>>(
  query: Query<T>,
  context: FinnaContext = createFinnaContext(),
): CompilationResult<T> {
  try {
    return { predicate: compile(query, context), context };
  } catch (error) {
    if (!isClass(error, AggregateError) || context.throwErrors) throw error;
    return { predicate: null, context };
  }
}
