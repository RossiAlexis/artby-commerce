import { describe, expect, it } from "vitest";
import { sendEmail } from "./send";
import { TestEmail } from "./templates/test-email";

describe("sendEmail", () => {
  it("sends a templated email via Resend's test sandbox address", async () => {
    const result = await sendEmail({
      to: "delivered@resend.dev",
      subject: "artby-commerce email wiring check",
      template: TestEmail({ checkedAt: new Date() }),
    });

    expect(result?.id).toBeTruthy();
  });
});
