import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { db } from "@/lib/db/client";
import { accounts, sessions, users, verificationTokens } from "@/lib/db/schema";
import { verifyCredentials } from "@/lib/auth/credentials";
import { jwt, session } from "@/lib/auth/callbacks";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: DrizzleAdapter(db, {
    usersTable: users,
    accountsTable: accounts,
    sessionsTable: sessions,
    verificationTokensTable: verificationTokens,
  }),
  // Credentials-based sign-in only supports JWT sessions — Google sign-ins
  // go through the same strategy for one consistent session shape.
  session: { strategy: "jwt" },
  providers: [
    Google,
    Credentials({
      credentials: { email: {}, password: {} },
      authorize: async (credentials) => {
        const { email, password } = credentials;
        if (typeof email !== "string" || typeof password !== "string") {
          return null;
        }
        return verifyCredentials({ email, password });
      },
    }),
  ],
  callbacks: { jwt, session },
});
