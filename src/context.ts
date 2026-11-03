import type { FinnaContext } from "./types.js";

/**
 * Creates a compilation context with an empty diagnostic collection.
 *
 * @param useUTC - Whether date operators use UTC components; defaults to false.
 * @returns A new context with the requested date mode and an empty errors array.
 */
export function createFinnaContext(useUTC = false): FinnaContext {
  return { useUTC, errors: [] };
}

/** A query compilation error with its location and original cause. */
export class QueryCompilationError extends Error {
  readonly path: readonly (string | number)[];

  /**
   * Creates a diagnostic preserving the original error and query location.
   *
   * @param cause - The original error or thrown value.
   * @param path - Query path segments; an empty path identifies the root.
   * @returns A diagnostic Error containing the path and original cause.
   */
  constructor(cause: unknown, path: readonly (string | number)[] = []) {
    const error = cause instanceof Error ? cause : new Error(String(cause));
    super(`${path.length ? path.join(".") : "<root>"}: ${error.message}`, { cause: error });
    this.name = "QueryCompilationError";
    this.path = [...path];
  }
}

/**
 * Creates a context at a nested query location while sharing collected errors.
 *
 * @param ctx - The parent compilation context.
 * @param key - The field, operator, or array index appended to the diagnostic path.
 * @returns A context with an extended path and the same errors array.
 */
export function childContext(ctx: FinnaContext, key: string | number): FinnaContext {
  return { ...ctx, path: [...(ctx.path ?? []), key] };
}

const compilationDepth = new WeakMap<Error[], number>();

/**
 * Runs compilation while collecting errors and tracking nested compilation boundaries.
 *
 * @param ctx - Context whose errors array identifies the shared compilation session.
 * @param build - The synchronous compilation function to execute.
 * @param fallback - The result used after a nested compilation failure, allowing sibling checks to continue.
 * @returns The compiled result, or the fallback for a failed nested compilation.
 * @throws {AggregateError} At the outermost boundary if this compilation collected any errors.
 */
export function withCompilation<T>(ctx: FinnaContext, build: () => T, fallback: T): T {
  const depth = compilationDepth.get(ctx.errors) ?? 0;
  const start = ctx.errors.length;
  compilationDepth.set(ctx.errors, depth + 1);
  let result = fallback;
  try {
    result = build();
  } catch (error) {
    ctx.errors.push(error instanceof QueryCompilationError ? error : new QueryCompilationError(error, ctx.path));
  } finally {
    if (depth === 0) compilationDepth.delete(ctx.errors);
    else compilationDepth.set(ctx.errors, depth);
  }
  if (depth === 0 && ctx.errors.length > start) {
    throw new AggregateError(ctx.errors.slice(start), "Failed to compile query");
  }
  return result;
}
