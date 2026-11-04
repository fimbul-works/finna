import { afterEach, describe, expect, it, vi } from "vitest";
import { compile } from "../src/compile.js";
import { createFinnaContext } from "../src/context.js";
import { createGtPredicate } from "../src/operators/comparison/gt.js";
import { registerOperator } from "../src/operators/operator-registry.js";
import { createTestLogger } from "./test-logger.js";

describe("createTestLogger", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
  });

  it("prints $field evaluation errors in test mode while recording logger and console calls", () => {
    vi.stubEnv("NODE_ENV", "test");
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    const logger = createTestLogger();
    const undo = registerOperator("$gt", createGtPredicate);
    try {
      const ctx = createFinnaContext({ logger });
      const predicate = compile({ value: { $gt: { $field: "minimum" } } }, ctx);
      expect(() => predicate({ value: Symbol(), minimum: 1 })).toThrow(AggregateError);
      expect(logger.error).toHaveBeenCalledTimes(1);
      expect(consoleError).toHaveBeenCalledTimes(1);
      const [details, message] = logger.error.mock.calls[0];
      expect(consoleError).toHaveBeenCalledWith(message, details);
      expect(details).toMatchObject({ phase: "evaluate", path: ["value", "$gt"] });
    } finally {
      undo();
    }
  });

  it("forwards warnings to console.warn in test mode", () => {
    vi.stubEnv("NODE_ENV", "test");
    const consoleWarn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const logger = createTestLogger();
    const details = { err: new Error("advice"), phase: "compile" as const, severity: "warning" as const, path: [] };
    logger.warn(details, "advice");
    expect(logger.warn).toHaveBeenCalledWith(details, "advice");
    expect(consoleWarn).toHaveBeenCalledWith("advice", details);
  });

  it("records both levels without console output outside test mode", () => {
    vi.stubEnv("NODE_ENV", "production");
    const consoleWarn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    const logger = createTestLogger();
    const details = { err: new Error("diagnostic"), phase: "compile" as const, severity: "error" as const, path: [] };
    logger.error(details, "diagnostic");
    logger.warn({ ...details, severity: "warning" }, "advice");
    expect(logger.error).toHaveBeenCalledTimes(1);
    expect(logger.warn).toHaveBeenCalledTimes(1);
    expect(consoleError).not.toHaveBeenCalled();
    expect(consoleWarn).not.toHaveBeenCalled();
  });
});
