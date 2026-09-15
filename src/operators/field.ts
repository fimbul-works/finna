import { getAtPath } from "@fimbul-works/nested-path";
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
    "$field" in value &&
    typeof value["$field" as keyof FieldReference] === "string"
  ) {
    if (!root) return undefined;
    return getAtPath(root, value["$field" as keyof FieldReference]);
  }
  return value;
}
