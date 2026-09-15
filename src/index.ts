import { finna } from "./finna.js";
import { registerAllOperators } from "./operator-registry.js";

export * from "./index.core.js";

registerAllOperators();

export default finna;
