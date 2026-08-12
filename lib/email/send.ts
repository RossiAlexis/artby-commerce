import type { ReactElement } from "react";
import { emailFrom, resend } from "./client";

export async function sendEmail({
  to,
  subject,
  template,
}: {
  to: string;
  subject: string;
  template: ReactElement;
}) {
  const { data, error } = await resend.emails.send({
    from: emailFrom,
    to,
    subject,
    react: template,
  });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}
