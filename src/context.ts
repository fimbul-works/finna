import { isBool, isClass, isFn, isStr } from "@fimbul-works/hvat";
import type {
  DiagnosticPhase,
  DiagnosticSeverity,
  FilterPredicate,
  FinnaContext,
  FinnaContextOptions,
  OperatorName,
} from "./types.js";

/** Creates an explicitly configured context; a boolean remains shorthand for useUTC. */
export function createFinnaContext(options: FinnaContextOptions | boolean = {}): FinnaContext {
  const settings = isBool(options) ? { useUTC: options } : options;
  return {
    useUTC: settings.useUTC ?? false,
    throwErrors: settings.throwErrors ?? true,
    warningsAsErrors: settings.warningsAsErrors ?? false,
    captureStacks: settings.captureStacks ?? false,
    logger: settings.logger,
    errors: [],
    warnings: [],
  };
}

/** Located diagnostic retaining its original exception as cause. */
export class QueryDiagnostic extends Error {
  readonly path: readonly (string | number)[];
  readonly phase: DiagnosticPhase;
  readonly severity: DiagnosticSeverity;
  readonly operator?: OperatorName;

  constructor(
    cause: unknown,
    ctx: Pick<FinnaContext, "path" | "captureStacks">,
    phase: DiagnosticPhase,
    severity: DiagnosticSeverity,
  ) {
    const error = isClass(cause, Error) ? cause : new Error(String(cause));
    const path = ctx.path ?? [];
    super(`${path.length ? path.join(".") : "<root>"}: ${error.message}`, { cause: error });
    this.name = "QueryDiagnostic";
    this.path = [...path];
    this.phase = phase;
    this.severity = severity;
    this.operator = [...path].reverse().find((part): part is OperatorName => isStr(part) && part.startsWith("$"));
    if (!ctx.captureStacks) delete this.stack;
  }
}

/** Compilation error with a query location and original cause. */
export class QueryCompilationError extends QueryDiagnostic {
  constructor(cause: unknown, path: readonly (string | number)[] = [], captureStacks = false) {
    super(cause, { captureStacks, path }, "compile", "error");
    this.name = "QueryCompilationError";
  }
}

/** Runtime error with a query location and original cause. */
export class QueryEvaluationError extends QueryDiagnostic {
  constructor(cause: unknown, ctx: FinnaContext) {
    super(cause, ctx, "evaluate", "error");
    this.name = "QueryEvaluationError";
  }
}

/** Extends the query location while sharing diagnostics and preserving configuration. */
export function childContext(ctx: FinnaContext, key: string | number): FinnaContext {
  const child = { ...ctx, path: [...(ctx.path ?? []), key] };
  contextOwners.set(child, ownerKey(ctx));
  return child;
}

interface EvaluationSession {
  context: FinnaContext;
  thrown: Error[];
}
const evaluations = new WeakMap<Error[], EvaluationSession[]>();
const compilationDepth = new WeakMap<Error[], number>();
const logged = new WeakSet<Error>();
const factoryContexts = new WeakMap<FinnaContext, FinnaContext>();
const contextOwners = new WeakMap<FinnaContext, Error[]>();

function ownerKey(ctx: FinnaContext): Error[] {
  return contextOwners.get(ctx) ?? ctx.errors;
}

function originalContext(ctx: FinnaContext): FinnaContext {
  const original = factoryContexts.get(ctx);
  return original ? originalContext(original) : ctx;
}

function activeSession(ctx: FinnaContext): EvaluationSession | undefined {
  return evaluations.get(ownerKey(ctx))?.at(-1);
}

function diagnostic(
  cause: unknown,
  ctx: FinnaContext,
  phase: DiagnosticPhase,
  severity: DiagnosticSeverity,
): QueryDiagnostic {
  if (isClass(cause, QueryDiagnostic) && cause.severity === severity) return cause;
  if (severity === "warning") return new QueryDiagnostic(cause, ctx, phase, severity);
  return phase === "compile"
    ? new QueryCompilationError(cause, ctx.path, ctx.captureStacks)
    : new QueryEvaluationError(cause, ctx);
}

function logDiagnostic(ctx: FinnaContext, error: QueryDiagnostic): void {
  if (!ctx.logger || logged.has(error)) return;
  logged.add(error);
  // Logging must not change matching behavior or replace the original diagnostic.
  try {
    ctx.logger[error.severity === "warning" ? "warn" : "error"](
      {
        err: error,
        phase: error.phase,
        severity: error.severity,
        path: error.path,
        operator: error.operator,
      },
      error.message,
    );
  } catch {
    /* A consumer-owned logger may fail independently of the query. */
  }
}

/** Records a warning once, preserving warning severity when escalation is enabled. */
export function reportWarning(ctx: FinnaContext, cause: unknown): void {
  const original = originalContext(ctx);
  const compiling = (compilationDepth.get(ctx.errors) ?? 0) > 0;
  const session = compiling ? undefined : activeSession(ctx);
  const target = compiling ? ctx : (session?.context ?? original);
  const warning = diagnostic(cause, original, session ? "evaluate" : "compile", "warning");
  if (!target.warnings.includes(warning)) target.warnings.push(warning);
  logDiagnostic(target, warning);
}

/** Records an error; strict APIs aggregate errors at the outer operation boundary. */
export function reportError(ctx: FinnaContext, cause: unknown): void {
  const original = originalContext(ctx);
  const compiling = (compilationDepth.get(ctx.errors) ?? 0) > 0;
  const session = compiling ? undefined : activeSession(ctx);
  const target = compiling ? ctx : (session?.context ?? original);
  const error = diagnostic(cause, original, session ? "evaluate" : "compile", "error");
  if (!target.errors.includes(error)) target.errors.push(error);
  logDiagnostic(target, error);
}

function normalize(
  ctx: FinnaContext,
  location: FinnaContext,
  phase: DiagnosticPhase,
  errors: number,
  warnings: number,
): void {
  for (const [list, start, severity] of [
    [ctx.errors, errors, "error"],
    [ctx.warnings, warnings, "warning"],
  ] as const) {
    for (let index = start; index < list.length; index++) {
      const entry = diagnostic(list[index], location, phase, severity);
      list[index] = entry;
      logDiagnostic(ctx, entry);
    }
  }
}

function failures(ctx: FinnaContext, errors = 0, warnings = 0): Error[] {
  return [...ctx.errors.slice(errors), ...(ctx.warningsAsErrors ? ctx.warnings.slice(warnings) : [])];
}

/** Gives custom factories execution-local error/warning arrays, including legacy direct pushes. */
export function operatorContext(ctx: FinnaContext): FinnaContext {
  const proxy = new Proxy(ctx, {
    get(target, key, receiver) {
      if (key === "errors" || key === "warnings") {
        const original = originalContext(target);
        if (compilationDepth.has(original.errors)) return original[key];
        return activeSession(target)?.context[key] ?? original[key];
      }
      return Reflect.get(target, key, receiver);
    },
  });
  factoryContexts.set(proxy, ctx);
  contextOwners.set(proxy, ownerKey(ctx));
  return proxy;
}

/** Guards predicate execution and aggregates only the diagnostics produced by this invocation. */
export function guardPredicate<T>(
  predicate: FilterPredicate<T>,
  ctx: FinnaContext,
  outermost = false,
): FilterPredicate<T> {
  return ((value: any, root?: any) => {
    const original = originalContext(ctx);
    const owner = ownerKey(ctx);
    const parent = activeSession(ctx);
    const ownsSession = outermost || !parent;
    const session = ownsSession ? { context: { ...ctx, errors: [], warnings: [] }, thrown: [] as Error[] } : parent;
    if (ownsSession) {
      const stack = evaluations.get(owner) ?? [];
      stack.push(session);
      evaluations.set(owner, stack);
    }
    const errors = session.context.errors.length;
    const warnings = session.context.warnings.length;
    let matched = false;
    try {
      matched = Boolean(predicate(value, root));
    } catch (cause) {
      if (
        isClass(cause, AggregateError) &&
        cause.errors.length > 0 &&
        cause.errors.every((error) => isClass(error, QueryDiagnostic))
      ) {
        for (const error of cause.errors) {
          session.thrown.push(error);
          const list = error.severity === "warning" ? session.context.warnings : session.context.errors;
          if (!list.includes(error)) list.push(error);
        }
      } else {
        const error = diagnostic(cause, ctx, "evaluate", "error");
        if (!session.context.errors.includes(error)) session.context.errors.push(error);
      }
    } finally {
      normalize(session.context, ctx, "evaluate", errors, warnings);
      if (ownsSession) {
        const stack = evaluations.get(owner)!;
        stack.pop();
        if (!stack.length) evaluations.delete(owner);
        for (const key of ["errors", "warnings"] as const) {
          for (const entry of session.context[key]) if (!original[key].includes(entry)) original[key].push(entry);
        }
      }
    }
    if (ownsSession) {
      const collected = [...new Set([...failures(session.context), ...session.thrown])];
      if (collected.length) throw new AggregateError(collected, "Failed to evaluate query");
    }
    return matched;
  }) as FilterPredicate<T>;
}

/** Collects sibling compilation diagnostics; invalid queries never yield partial predicates. */
export function withCompilation<T>(ctx: FinnaContext, build: () => T, fallback: T): T {
  const depth = compilationDepth.get(ctx.errors) ?? 0;
  const errors = ctx.errors.length;
  const warnings = ctx.warnings.length;
  compilationDepth.set(ctx.errors, depth + 1);
  let result = fallback;
  try {
    result = build();
  } catch (cause) {
    reportError(ctx, cause);
  } finally {
    normalize(ctx, ctx, "compile", errors, warnings);
    if (depth === 0) compilationDepth.delete(ctx.errors);
    else compilationDepth.set(ctx.errors, depth);
  }
  if (depth === 0) {
    const collected = failures(ctx, errors, warnings);
    if (collected.length) throw new AggregateError(collected, "Failed to compile query");
  }
  return (isFn(result) ? guardPredicate(result as FilterPredicate, ctx, depth === 0) : result) as T;
}
