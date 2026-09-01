import { describe, expect, it } from "vitest";
import { contactAction } from "@/app/actions/contact";

describe("contactAction", () => {
  // Resend's sandbox address always "delivers" without actually emailing
  // anyone (https://resend.com/docs/dashboard/emails/send-test-emails).
  // Skipped: requires a valid RESEND_API_KEY (currently 401s), see email test skip.
  it.skip("emails the admin with the submitted name, email, and message", async () => {
    const result = await contactAction({
      name: "Jane Doe",
      email: "delivered@resend.dev",
      message: "¿Tenés esta obra disponible en otro tamaño?",
    });

    expect(result).toEqual({ success: true });
  });

  it("rejects an invalid email", async () => {
    const result = await contactAction({
      name: "Jane Doe",
      email: "not-an-email",
      message: "Hola",
    });

    expect(result).toEqual({
      success: false,
      error: "Completa tu nombre, email y mensaje.",
    });
  });

  it("rejects an empty message", async () => {
    const result = await contactAction({
      name: "Jane Doe",
      email: "jane@example.com",
      message: "   ",
    });

    expect(result).toEqual({
      success: false,
      error: "Completa tu nombre, email y mensaje.",
    });
  });
});
