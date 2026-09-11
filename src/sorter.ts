import { getAtPath } from "@fimbul-works/nested-path";
import type { SortOrder } from "./types.js";

/**
 * Creates a compare function for sorting matches.
 *
 * @template T - Type of the value
 * @param {Record<string, SortOrder>} sortConfig - Sort configuration
 * @returns {(a: T, b: T) => number} A compare function
 */
export function createSorter<T extends Record<string, any>>(
  sortConfig: Record<string, SortOrder>,
): (a: T, b: T) => number {
  const fields = Object.entries(sortConfig);

  return (a: T, b: T) => {
    for (const [path, order] of fields) {
      const valA = getAtPath(a, path);
      const valB = getAtPath(b, path);

      if (valA === valB) continue;

      if (valA === undefined || valA === null) return order;
      if (valB === undefined || valB === null) return -order;

      if (valA < valB) return -order;
      if (valA > valB) return order;
    }
    return 0;
  };
}
