import { vi } from "vitest";

// Every test run — CI or local, real RESEND_API_KEY or not — must never make
// a live call to Resend: checkoutCart's admin-notification leg sends to a
// real inbox (ADMIN_EMAIL), not a sandbox address, so a valid key here would
// email a real person and burn Resend's send quota on every test run.
vi.mock("@/lib/email/client", () => ({
  resend: {
    emails: {
      send: vi.fn(async () => ({
        data: { id: "test-email-id" },
        error: null,
        headers: null,
      })),
    },
  },
  emailFrom: "test@example.com",
}));
