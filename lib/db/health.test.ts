import { describe, expect, it } from "vitest";
import { pingDatabase } from "./health";

describe("pingDatabase", () => {
  it("inserts and returns a health check row from a real database", async () => {
    const before = Date.now();

    const row = await pingDatabase();

    expect(row.id).toBeGreaterThan(0);
    expect(row.checkedAt.getTime()).toBeGreaterThanOrEqual(before - 1000);
  });
});
