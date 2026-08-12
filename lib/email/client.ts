import { Resend } from "resend";

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} is not set`);
  }
  return value;
}

export const resend = new Resend(requireEnv("RESEND_API_KEY"));
export const emailFrom = requireEnv("EMAIL_FROM");
