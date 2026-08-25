"use server";
import z from "zod";
import { subscribe } from "@/lib/db/subscribers";

const subscribeSchema = z.object({
  email: z.string().trim().toLowerCase().pipe(z.email()),
});

export type SubscribeResult =
  { success: true } | { success: false; error: string };

export async function subscribeAction(
  input: z.infer<typeof subscribeSchema>,
): Promise<SubscribeResult> {
  const parsed = subscribeSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "Ingresá un email válido." };
  }

  try {
    await subscribe(parsed.data.email);
  } catch {
    return {
      success: false,
      error: "No pudimos guardar tu email. Intenta nuevamente.",
    };
  }

  return { success: true };
}
