import { describe, expect, it } from "vitest";
import { contactAction } from "@/app/actions/contact";

describe("contactAction", () => {
  // Goes through the mocked Resend client (test/setup/mock-email.ts) — never
  // hits the network, so this doesn't depend on a real RESEND_API_KEY.
  it("emails the admin with the submitted name, email, and message", async () => {
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
