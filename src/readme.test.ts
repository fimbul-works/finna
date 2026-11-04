import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import * as finna from "./index.js";

const projectDirectory = fileURLToPath(new URL("../", import.meta.url));
const readme = readFileSync(resolve(projectDirectory, "README.md"), "utf8");
const pkg = JSON.parse(readFileSync(resolve(projectDirectory, "package.json"), "utf8"));
const examples = [...readme.matchAll(/<!-- example: ([\w-]+) -->\s*```typescript\n([\s\S]*?)```/g)].map(
  ([, id, source]) => ({ id, source }),
);
const operatorModules = import.meta.glob(["./operators/**/*.ts", "!./operators/**/*.test.ts"], { eager: true });

/** Resolve only entry points actually advertised by package.json, against their source modules. */
function sourceForImport(specifier: string): string {
  if (specifier !== pkg.name && !specifier.startsWith(`${pkg.name}/`)) {
    throw new Error(`Unexpected README import: ${specifier}`);
  }
  const key = specifier === pkg.name ? "." : `.${specifier.slice(pkg.name.length)}`;
  let entry = pkg.exports[key];
  let wildcard = "";
  if (!entry) {
    for (const [pattern, target] of Object.entries(pkg.exports)) {
      const [prefix, suffix] = pattern.split("*");
      if (suffix !== undefined && key.startsWith(prefix) && key.endsWith(suffix)) {
        entry = target;
        wildcard = key.slice(prefix.length, suffix ? -suffix.length : undefined);
        break;
      }
    }
  }
  if (!entry) throw new Error(`README uses an unavailable package export: ${specifier}`);
  return entry.import
    .replace("*", wildcard)
    .replace(/^\.\/dist\/esm\//, "./")
    .replace(/\.js$/, ".ts");
}

function requireExample(specifier: string): unknown {
  const source = sourceForImport(specifier);
  if (source === "./index.ts") return finna;
  const module = operatorModules[source];
  if (!module) throw new Error(`README import has no source module: ${specifier}`);
  return module;
}

const expectedOutput: Record<string, { logs: unknown[][]; errors?: unknown[][] }> = {
  "all-operators": { logs: [[true]] },
  "ast-core": { logs: [[true]] },
  "individual-factories": { logs: [[true]] },
  match: { logs: [[true]] },
  compile: { logs: [[[{ id: "3", title: "USB-C Hub", price: 35, inStock: true }]]] },
  categories: { logs: [[true]] },
  "field-dates": { logs: [[true], [true]] },
  predicates: { logs: [[true], [true], [true]] },
  transformations: { logs: [[true], [true]] },
  "custom-operator": { logs: [[true]] },
  "compilation-errors": {
    logs: [],
    errors: [
      ["compile", "age.$in"],
      ["compile", "role.$nin"],
    ],
  },
  "result-apis": { logs: [[true], [true], [null], [1]] },
  "custom-logger": { logs: [[null], [1, 0], [["evaluate:value.$positive"]]] },
};

describe("README examples", () => {
  beforeEach(finna.clearOperators);
  afterEach(finna.clearOperators);

  it("covers every TypeScript block with a distinct example and expected output", () => {
    expect(examples.length).toBe([...readme.matchAll(/```typescript\n/g)].length);
    expect(new Set(examples.map(({ id }) => id)).size).toBe(examples.length);
    expect(examples.map(({ id }) => id).sort()).toEqual(Object.keys(expectedOutput).sort());
  });

  it.each(examples)("executes $id independently with its documented output", ({ id, source }) => {
    const console = { log: vi.fn(), error: vi.fn(), warn: vi.fn() };
    const javascript = ts.transpileModule(source, {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ESNext },
    }).outputText;
    // The README is trusted repository code. Each block gets only its own imports and setup.
    new Function("require", "exports", "console", javascript)(requireExample, {}, console);
    expect(console.log.mock.calls).toEqual(expectedOutput[id].logs);
    expect(console.error.mock.calls).toEqual(expectedOutput[id].errors ?? []);
    expect(console.warn).not.toHaveBeenCalled();
  });

  it("type-checks the exact examples against current source exports", () => {
    const options: ts.CompilerOptions = {
      target: ts.ScriptTarget.ESNext,
      module: ts.ModuleKind.ESNext,
      moduleResolution: ts.ModuleResolutionKind.Bundler,
      strict: true,
      noEmit: true,
      skipLibCheck: true,
      types: ["node"],
    };
    const virtualFiles = new Map(
      examples.map(({ id, source }) => [resolve(projectDirectory, "src", ".readme-examples", `${id}.ts`), source]),
    );
    const host = ts.createCompilerHost(options);
    const originalGetSourceFile = host.getSourceFile.bind(host);
    host.getSourceFile = (filename, languageVersion, onError, shouldCreateNewSourceFile) => {
      const source = virtualFiles.get(filename);
      return source === undefined
        ? originalGetSourceFile(filename, languageVersion, onError, shouldCreateNewSourceFile)
        : ts.createSourceFile(filename, source, ts.ScriptTarget.ESNext, true);
    };
    host.resolveModuleNames = (specifiers, containingFile) =>
      specifiers.map((specifier) => {
        if (specifier === pkg.name || specifier.startsWith(`${pkg.name}/`)) {
          return {
            resolvedFileName: resolve(projectDirectory, "src", sourceForImport(specifier)),
            extension: ts.Extension.Ts,
          };
        }
        return ts.resolveModuleName(specifier, containingFile, options, host).resolvedModule;
      });
    const program = ts.createProgram([...virtualFiles.keys()], options, host);
    const diagnostics = ts.getPreEmitDiagnostics(program);
    const formatted = ts.formatDiagnosticsWithColorAndContext(diagnostics, {
      getCanonicalFileName: (filename) => filename,
      getCurrentDirectory: () => projectDirectory,
      getNewLine: () => "\n",
    });
    expect(formatted).toBe("");
  });
});
