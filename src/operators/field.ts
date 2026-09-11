import { getAtPath } from "@fimbul-works/nested-path";
import { QUERY_FIELD } from "../constants.js";
import type { FieldReference } from "../types.js";
import { isObject } from "../util.js";

/**
 * Resolves a value, which could be a literal or a field reference.
 *
 * @param {any} value - Value to resolve
 * @param {any} root - Root value for field resolution
 * @returns {any} Resolved value
 */
export function resolveValue(value: any, root?: any): any {
  if (
    isObject<FieldReference>(value) &&
    QUERY_FIELD in value &&
    typeof value[QUERY_FIELD as keyof FieldReference] === "string"
  ) {
    if (!root) return undefined;
    return getAtPath(root, value[QUERY_FIELD as keyof FieldReference]);
  }
  return value;
}
