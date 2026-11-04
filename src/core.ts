/** Engine and explicit registration APIs, without importing built-in operator groups. */
export { compile, match } from "./compile.js";
export { compileResult } from "./compile-result.js";
export {
  createFinnaContext,
  QueryCompilationError,
  QueryDiagnostic,
  QueryEvaluationError,
  reportError,
  reportWarning,
} from "./context.js";
export { evaluate } from "./evaluate.js";
export { fieldReference } from "./operators/field-reference.js";
export {
  clearOperators,
  getOperator,
  hasOperator,
  listOperators,
  operatorMap,
  registerOperator,
  registerOperators,
  unregisterOperator,
} from "./operators/operator-registry.js";
export { createOperatorPredicate, createPredicate } from "./predicate.js";
export * from "./types.js";
export { isOperatorObject } from "./util.js";
