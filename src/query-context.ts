import type { QueryContext } from "./types.js";

/**
 * Creates a new query context.
 */
export function createQueryContext(useUTC: boolean = false): QueryContext {
  return {
    useUTC,
    warnings: new Set<string>(),
  };
}
