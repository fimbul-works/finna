import { defineConfig, type UserConfig } from "tsdown";

const entryPoints: Record<string, string> = {
  finna: "src/index.ts",
  "finna.engine": "src/bundles/bundle.engine.ts",
  "finna.core": "src/bundles/bundle.core.ts",
  "finna.extended": "src/bundles/bundle.extended.ts",
  "finna.equality": "src/bundles/bundle.equality.ts",
  "finna.comparison": "src/bundles/bundle.comparison.ts",
  "finna.element": "src/bundles/bundle.element.ts",
  "finna.string": "src/bundles/bundle.string.ts",
  "finna.date": "src/bundles/bundle.date.ts",
  "finna.array": "src/bundles/bundle.array.ts",
  "finna.core.date": "src/bundles/bundle.core.date.ts",
  "finna.core.array": "src/bundles/bundle.core.array.ts",
  "finna.core.extended": "src/bundles/bundle.core.extended.ts",
};

const appDeps = {
  alwaysBundle: ["@fimbul-works/nested-path", "@fimbul-works/hvat"],
};

const commonConfig: UserConfig = {
  platform: "neutral",
  format: ["esm"],
  target: "es2022",
  dts: true,
  treeshake: true,
  outDir: "bundles",
  // build:bundles cleans once; individual builds must not erase each other's output.
  clean: false,
  inputOptions: {
    optimization: {
      inlineConst: false,
    },
    experimental: {
      attachDebugInfo: "none",
    },
  },
};

// Build each entry independently so every size includes its own engine and dependencies.
export default defineConfig(
  Object.entries(entryPoints).map(([key, entry]) => ({
    entry: {
      [key]: entry,
    },
    ...commonConfig,
    deps:
      key === "finna"
        ? {
            alwaysBundle: ["@fimbul-works/nested-path", "@fimbul-works/hvat"],
          }
        : {},
  })),
);
