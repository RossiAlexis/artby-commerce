import bcrypt from "bcryptjs";
import { getUserByEmail } from "@/lib/db/users";

export async function verifyCredentials({
  email,
  password,
}: {
  email: string;
  password: string;
}) {
  const user = await getUserByEmail(email);
  if (!user?.passwordHash) return null;

  const passwordMatches = await bcrypt.compare(password, user.passwordHash);
  if (!passwordMatches) return null;

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    isAdmin: user.isAdmin,
  };
}
