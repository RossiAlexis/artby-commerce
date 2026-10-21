import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },
  test: {
    globalSetup: ["./test/setup/global-setup.ts"],
    setupFiles: ["./test/setup/mock-email.ts"],
    include: ["**/*.test.ts"],
    testTimeout: 20_000,
    hookTimeout: 60_000,
    // CI shares one Neon branch across files. A stalled insert times out
    // the test, then the same file continues. One retry covers that stall.
    retry: process.env.CI ? 1 : 0,
  },
});
