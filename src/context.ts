import type { FinnaContext } from "./types.js";

/**
 * Creates a new query context.
 */
export function createFinnaContext(useUTC: boolean = false): FinnaContext {
  return {
    useUTC,
    warnings: new Set<string>(),
  };
}
