import { Resend } from "resend";
import { requireEnv } from "@/lib/env";

export const resend = new Resend(requireEnv("RESEND_API_KEY"));
export const emailFrom = requireEnv("EMAIL_FROM");
