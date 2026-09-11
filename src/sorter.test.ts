import { describe, expect, it } from "vitest";
import { createSorter } from "./sorter.js";

describe("createSorter", () => {
  const docs = [
    { id: 1, name: "John", age: 30, score: 100 },
    { id: 2, name: "Jane", age: 25, score: 150 },
    { id: 3, name: "Bob", age: 30, score: 50 },
    { id: 4, name: "Alice", age: 20, score: 120 },
  ];

  it("should sort by a single field ascending", () => {
    const sorter = createSorter({ age: 1 });
    const sorted = [...docs].sort(sorter);
    expect(sorted.map((d) => d.id)).toEqual([4, 2, 1, 3]);
  });

  it("should sort by a single field descending", () => {
    const sorter = createSorter({ age: -1 });
    const sorted = [...docs].sort(sorter);
    expect(sorted.map((d) => d.id)).toEqual([1, 3, 2, 4]); // 30, 30, 25, 20 (id 1, 3 order depends on stability if not for second field)
  });

  it("should sort by multiple fields", () => {
    const sorter = createSorter({ age: 1, score: -1 });
    const sorted = [...docs].sort(sorter);
    // Age: 20, 25, 30, 30
    // Score for 30: 100, 50 -> descending: 100 then 50
    expect(sorted.map((d) => d.id)).toEqual([4, 2, 1, 3]);
  });

  it("should sort by nested fields", () => {
    const nestedDocs = [
      { id: 1, stats: { level: 2 } },
      { id: 2, stats: { level: 1 } },
      { id: 3, stats: { level: 3 } },
    ];
    const sorter = createSorter({ "stats.level": 1 });
    const sorted = [...nestedDocs].sort(sorter);
    expect(sorted.map((d) => d.id)).toEqual([2, 1, 3]);
  });

  it("should handle null/undefined values", () => {
    const mixedDocs = [
      { id: 1, value: 10 },
      { id: 2, value: null },
      { id: 3, value: 20 },
    ];
    // ascending: null/undefined go to end (mongo style usually)
    // My implementation: if valA is null, return 1 (order), meaning valA comes after valB
    const sorter = createSorter({ value: 1 });
    const sorted = [...mixedDocs].sort(sorter);
    expect(sorted.map((d) => d.id)).toEqual([1, 3, 2]);
  });
});
