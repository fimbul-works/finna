import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // Show expected diagnostics from passing logger tests as well as failures.
    silent: false,
  },
});
