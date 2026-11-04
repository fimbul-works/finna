import { expect, it, vi } from "vitest";

it("imports both entry points without registering operators", async () => {
  vi.resetModules();
  const main = await import("./index.js");
  expect(main.operatorMap.size).toBe(0);
  expect(main.match({ x: 1 }, { x: 1 })).toBe(true);
  expect(() => main.compile({ x: { $gt: 0 } })).toThrow(AggregateError);
  main.registerComparisonOperators();
  const predicate = main.compile({ value: { $gt: { $field: "limits.minimum" } } });
  expect(predicate({ value: 10, limits: { minimum: 9 } })).toBe(true);
  expect(predicate({ value: 10, limits: { minimum: 10 } })).toBe(false);
});
