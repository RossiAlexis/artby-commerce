import type { NextAuthConfig } from "next-auth";

type Callbacks = NonNullable<NextAuthConfig["callbacks"]>;
type JwtCallback = NonNullable<Callbacks["jwt"]>;
type SessionCallback = NonNullable<Callbacks["session"]>;

// Copies the admin/Customer distinction from the DB user row onto the JWT
// (only available on sign-in) and then onto the session, so it's obtainable
// in a Server Component/Server Action without a DB round-trip per request.
export const jwt: JwtCallback = async ({ token, user }) => {
  if (user) {
    token.isAdmin = user.isAdmin;
  }
  return token;
};

export const session: SessionCallback = async ({ session, token }) => {
  session.user.isAdmin = Boolean(token.isAdmin);
  // `token.sub` is the signed-in user's id (set by Auth.js from the
  // Adapter/Credentials user before this callback runs) — exposed on the
  // session so Server Components/Actions can scope Orders to this Customer
  // without an extra DB round-trip.
  if (token.sub) {
    session.user.id = token.sub;
  }
  return session;
};
