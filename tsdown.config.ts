import { defineConfig, type UserConfig } from "tsdown";

const entryPoints: Record<string, string> = {
  bundle: "src/index.ts",
  core: "src/index.core.ts",
  constants: "src/constants.ts",
};

const commonConfig: UserConfig = {
  platform: "neutral",
  format: ["esm"],
  target: "es2022",
  dts: true,
  treeshake: true,
  outDir: "bundles",
  inputOptions: {
    optimization: {
      inlineConst: false,
    },
    experimental: {
      attachDebugInfo: "none",
    },
  },
  deps: {
    alwaysBundle: ["@fimbul-works/nested-path"],
  },
};

export default defineConfig(
  Object.entries(entryPoints).map(([key, entry]) => ({
    entry: {
      [key]: entry,
    },
    ...commonConfig,
  })),
);
