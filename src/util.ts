import { isArr, isClass, isObj } from "@fimbul-works/hvat";

/**
 * Performs a deep equality check between two values.
 *
 * @param {any} a - First value
 * @param {any} b - Second value
 * @returns {boolean} `true` if values are deeply equal, `false` otherwise
 */
export function isDeepEqual(a: any, b: any): boolean {
  if (Object.is(a, b)) return true;

  if (isClass(a, Date) && isClass(b, Date)) {
    return a.getTime() === b.getTime();
  }

  if (isArr(a) && isArr(b)) {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      if (!isDeepEqual(a[i], b[i])) return false;
    }
    return true;
  }

  if (isObj(a) && isObj(b)) {
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
 * Checks if a value is a nonempty operator object whose keys all start with $.
 *
 * @param {any} val - Value to check
 * @returns {val is Record<string, any>} `true` if it's an operator object, `false` otherwise
 */
export function isOperatorObject(val: any): val is Record<string, any> {
  if (!isObj(val)) {
    return false;
  }

  const keys = Object.keys(val);
  if (keys.length === 0) {
    return false;
  }

  const hasOperators = keys.some((k) => k.startsWith("$"));
  if (hasOperators) {
    if (!keys.every((k) => k.startsWith("$"))) {
      throw new Error("Mixing operator keys with regular keys is not allowed.");
    }
    return true;
  }

  return false;
}
