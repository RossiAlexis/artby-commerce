import { describe, expect, it } from "vitest";
import {
  DEFAULT_PAGE_SIZE,
  MAX_PAGE_SIZE,
  resolvePage,
  resolvePageSize,
} from "./artworks-pagination";

describe("resolvePage", () => {
  it("defaults to 1 when omitted", () => {
    expect(resolvePage(undefined)).toBe(1);
  });

  it("passes through a valid positive integer", () => {
    expect(resolvePage(3)).toBe(3);
  });

  it("falls back to 1 for zero, negative, or non-integer values", () => {
    expect(resolvePage(0)).toBe(1);
    expect(resolvePage(-5)).toBe(1);
    expect(resolvePage(1.5)).toBe(1);
  });
});

describe("resolvePageSize", () => {
  it("defaults to DEFAULT_PAGE_SIZE when omitted", () => {
    expect(resolvePageSize(undefined)).toBe(DEFAULT_PAGE_SIZE);
  });

  it("passes through a valid pageSize within bounds", () => {
    expect(resolvePageSize(30)).toBe(30);
  });

  it("falls back to the default instead of allowing a table-wide fetch for an oversized value", () => {
    expect(resolvePageSize(1_000_000)).toBe(DEFAULT_PAGE_SIZE);
    expect(resolvePageSize(MAX_PAGE_SIZE + 1)).toBe(DEFAULT_PAGE_SIZE);
  });

  it("falls back to the default for zero, negative, or non-integer values", () => {
    expect(resolvePageSize(0)).toBe(DEFAULT_PAGE_SIZE);
    expect(resolvePageSize(-10)).toBe(DEFAULT_PAGE_SIZE);
    expect(resolvePageSize(2.5)).toBe(DEFAULT_PAGE_SIZE);
  });
});
