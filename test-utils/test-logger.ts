import { vi } from "vitest";
import type { FinnaLogger } from "../src/types.js";

/** Track structured diagnostics and display them during test runs. */
export function createTestLogger() {
  return {
    warn: vi.fn<FinnaLogger["warn"]>((details, message) => {
      if (process.env.NODE_ENV === "test") console.warn(message, details);
    }),
    error: vi.fn<FinnaLogger["error"]>((details, message) => {
      if (process.env.NODE_ENV === "test") console.error(message, details);
    }),
  };
}
