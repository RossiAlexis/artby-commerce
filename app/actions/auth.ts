"use server";
import z from "zod";
import { createCustomerAccount, getUserByEmail } from "@/lib/db/users";

const signUpCustomerSchema = z.object({
  name: z.string().trim().min(1).optional(),
  email: z.email().trim(),
  password: z.string().min(8),
});

export type SignUpCustomerResult =
  { success: true } | { success: false; error: string };

export async function signUpCustomer(
  input: z.infer<typeof signUpCustomerSchema>,
): Promise<SignUpCustomerResult> {
  const parsed = signUpCustomerSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "Invalid email or password." };
  }
  const { name, email, password } = parsed.data;

  const existing = await getUserByEmail(email);
  if (existing) {
    return {
      success: false,
      error: "An account with that email already exists.",
    };
  }

  await createCustomerAccount({ email, password, name });
  return { success: true };
}
