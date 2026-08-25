"use server";
import z from "zod";
import { sendEmail } from "@/lib/email/send";
import { ContactMessageEmail } from "@/lib/email/templates/contact-message";
import { requireEnv } from "@/lib/env";

const contactSchema = z.object({
  name: z.string().trim().min(1),
  email: z.string().trim().toLowerCase().pipe(z.email()),
  message: z.string().trim().min(1),
});

export type ContactResult =
  { success: true } | { success: false; error: string };

export async function contactAction(
  input: z.infer<typeof contactSchema>,
): Promise<ContactResult> {
  const parsed = contactSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "Completa tu nombre, email y mensaje." };
  }

  try {
    await sendEmail({
      to: requireEnv("ADMIN_EMAIL"),
      subject: `Nuevo mensaje de contacto de ${parsed.data.name}`,
      template: ContactMessageEmail(parsed.data),
    });
  } catch {
    return {
      success: false,
      error: "No pudimos enviar tu mensaje. Intenta nuevamente.",
    };
  }

  return { success: true };
}
