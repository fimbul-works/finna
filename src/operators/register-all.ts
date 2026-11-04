import { dateOperators } from "./date/index.js";
import { registerOperators } from "./operator-registry.js";
import { coreOperators } from "./register-core.js";
import { extendedOperators } from "./register-extended.js";

/**
 * Registers core (including arrays), date, and extended operators in a single atomic batch.
 * For smaller bundles use the group helpers or register individual imported factories.
 * @returns An idempotent cleanup removing only this call's installations.
 * @throws {Error} If any built-in conflicts; no registrations are changed.
 */
export function registerAllOperators(): () => void {
  return registerOperators([...coreOperators, ...dateOperators, ...extendedOperators]);
}
