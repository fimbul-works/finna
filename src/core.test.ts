import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { build } from "tsdown";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { clearOperators, compile, listOperators, registerOperator } from "./core.js";
import { createEqPredicate } from "./operators/equality/eq.js";

async function bundleConsumer(source: string): Promise<string> {
  const directory = await mkdtemp(join(tmpdir(), "finna-consumer-"));
  try {
    const entry = join(directory, "consumer.ts");
    await writeFile(entry, source);
    const result = await build({
      config: false,
      entry: [entry],
      format: "esm",
      dts: false,
      write: false,
      clean: false,
      logLevel: "silent",
      treeshake: true,
    });
    try {
      return result.bundles
        .flatMap((bundle) => bundle.chunks)
        .map((chunk) => (chunk.type === "chunk" ? chunk.code : ""))
        .join("\n");
    } finally {
      // @ts-expect-error
      for (const bundle of result.bundles) await bundle[Symbol.asyncDispose]();
    }
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
}

describe("core entry point", () => {
  beforeEach(clearOperators);
  afterEach(clearOperators);

  it("supports literal matching with an empty registry", () => {
    expect(listOperators().size).toBe(0);
    expect(compile({ value: 10 })({ value: 10 })).toBe(true);
    expect(() => compile({ value: { $eq: 10 } })).toThrow(AggregateError);
  });

  it("supports cherry-picked operators and $field references", () => {
    registerOperator("$eq", createEqPredicate);
    expect([...listOperators().keys()]).toEqual(["$eq"]);
    const predicate = compile({ value: { $eq: { $field: "expected.value" } } });
    expect(predicate({ value: 10, expected: { value: 10 } })).toBe(true);
    expect(predicate({ value: 10, expected: { value: 11 } })).toBe(false);
  });

  it("tree-shakes unselected operators from a named main-entry import", async () => {
    const main = fileURLToPath(new URL("./index.ts", import.meta.url));
    const code = await bundleConsumer(`
      import { compile, registerOperator, createEqPredicate } from ${JSON.stringify(main)};
      registerOperator('$eq', createEqPredicate);
      export const predicate = compile({ value: { $eq: { $field: 'expected' } } });
    `);
    expect(code).toContain("function createEqPredicate");
    for (const name of ["Gt", "Year", "All", "Regex", "ReplaceAll", "Uppercase", "IsString"]) {
      expect(code).not.toContain(`function create${name}Predicate`);
    }
    expect(code).not.toContain("const coreOperators");
    expect(code).not.toContain("const extendedOperators");
  });

  it("includes arrays and tree-shakes dates and extensions when only the core group is selected", async () => {
    const main = fileURLToPath(new URL("./index.ts", import.meta.url));
    const code = await bundleConsumer(`
      import { compile, registerCoreOperators } from ${JSON.stringify(main)};
      registerCoreOperators();
      export const predicate = compile({ value: { $gt: { $field: 'expected' } } });
    `);
    for (const name of ["Eq", "Gt", "Regex", "All", "Some", "None", "Size"])
      expect(code).toContain(`function create${name}Predicate`);
    for (const name of ["Year", "ReplaceAll", "Uppercase", "IsString"]) {
      expect(code).not.toContain(`function create${name}Predicate`);
    }
  });
});
