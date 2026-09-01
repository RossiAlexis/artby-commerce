import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: "list",
  timeout: 30_000,
  globalSetup: "./e2e/fixtures/global-setup.ts",
  use: {
    baseURL: "http://localhost:3000",
    trace: "retain-on-failure",
  },
  projects: [
    {
      name: "desktop",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      // Only the responsive/mobile-nav spec runs here — every other spec
      // already ran once under `desktop` and would otherwise race the same
      // shared fixture rows a second time from a second worker. Chromium-based
      // (Pixel 7), not iPhone/WebKit, since only Chromium is installed.
      name: "mobile",
      use: { ...devices["Pixel 7"] },
      testMatch: /responsive\.spec\.ts/,
    },
  ],
});
