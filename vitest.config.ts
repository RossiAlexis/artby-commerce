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
  },
});
