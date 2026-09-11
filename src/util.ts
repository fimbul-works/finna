import { QUERY_PREFIX } from "./constants.js";

/**
 * Check if a value is an object.
 * @param {any} value - The value to check
 * @returns {boolean} `true` if the value is an object, `false` otherwise
 */
export function isObject<T extends object = object>(value: any): value is T {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

/**
 * Performs a deep equality check between two values.
 *
 * @param {any} a - First value
 * @param {any} b - Second value
 * @returns {boolean} `true` if values are deeply equal, `false` otherwise
 */
export function isDeepEqual(a: any, b: any): boolean {
  if (Object.is(a, b)) return true;

  if (a instanceof Date && b instanceof Date) {
    return a.getTime() === b.getTime();
  }

  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      if (!isDeepEqual(a[i], b[i])) return false;
    }
    return true;
  }

  if (isObject(a) && isObject(b)) {
    const keysA = Object.keys(a);
    const keysB = Object.keys(b);
    if (keysA.length !== keysB.length) return false;
    for (const key of keysA) {
      if (!Object.hasOwn(b, key) || !isDeepEqual(a[key as keyof typeof a], b[key as keyof typeof b])) {
        return false;
      }
    }
    return true;
  }

  return false;
}

/**
 * Checks if a value is an operator object (all keys start with $).
 *
 * @param {any} val - Value to check
 * @returns {val is Record<string, any>} `true` if it's an operator object, `false` otherwise
 */
export function isOperatorObject(val: any): val is Record<string, any> {
  if (!isObject(val)) {
    return false;
  }

  const keys = Object.keys(val);
  if (keys.length === 0) {
    return false;
  }

  const hasOperators = keys.some((k) => k.startsWith(QUERY_PREFIX));
  if (hasOperators) {
    if (!keys.every((k) => k.startsWith(QUERY_PREFIX))) {
      throw new Error("Mixing operator keys with regular keys is not allowed.");
    }
    return true;
  }

  return false;
}
