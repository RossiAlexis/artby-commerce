import { beforeEach, describe, expect, it, vi } from "vitest";
import { emailFrom, resend } from "./client";
import { sendEmail } from "./send";
import { TestEmail } from "./templates/test-email";

const sendMock = vi.mocked(resend.emails.send);

describe("sendEmail", () => {
  beforeEach(() => {
    sendMock.mockClear();
  });

  it("sends the template through Resend and returns the response data", async () => {
    const result = await sendEmail({
      to: "delivered@resend.dev",
      subject: "artby-commerce email wiring check",
      template: TestEmail({ checkedAt: new Date() }),
    });

    expect(sendMock).toHaveBeenCalledWith(
      expect.objectContaining({
        from: emailFrom,
        to: "delivered@resend.dev",
        subject: "artby-commerce email wiring check",
      }),
    );
    expect(result?.id).toBeTruthy();
  });

  it("throws when Resend returns an error", async () => {
    sendMock.mockResolvedValueOnce({
      data: null,
      error: {
        message: "API key is invalid",
        statusCode: 401,
        name: "invalid_api_key",
      },
      headers: null,
    });

    await expect(
      sendEmail({
        to: "delivered@resend.dev",
        subject: "artby-commerce email wiring check",
        template: TestEmail({ checkedAt: new Date() }),
      }),
    ).rejects.toThrow("API key is invalid");
  });
});
