import { registerAllOperators } from "./operator-registry.js";

export * from "./index.core.js";
export * from "./predicate.js";
export * from "./constants.js";

registerAllOperators();
