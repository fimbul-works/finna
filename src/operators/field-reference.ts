import { isObj, isStr } from "@fimbul-works/hvat";
import { type Container, getAtPath, type PathArgument } from "@fimbul-works/nested-path";
import type { FieldReference } from "../types.js";

/**
 * Resolves a value, which could be a literal or a field reference.
 *
 * @template T Type of root containerr
 * @template P Type of field reference path
 * @param {any} value - Value to resolve
 * @param {any} root - Root value for field resolution
 * @returns {any} The referenced root field, undefined if unavailable, or the unchanged literal value.
 */
export function fieldReference<T extends Container = any, const P extends string = string>(
  value: FieldReference,
  root: T,
): FieldReference {
  if (isObj<FieldReference>(value) && isStr(value.$field)) {
    if (!root) return undefined as any;
    return getAtPath<T, P>(root as T, value.$field as PathArgument<NoInfer<T>, P>) as FieldReference;
  }
  return value;
}
