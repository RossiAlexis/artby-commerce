# Use Auth.js (self-hosted) instead of a managed auth provider

Both the single admin login and the optional Customer accounts need authentication (email/password + Google OAuth). We considered a managed provider (Clerk/Auth0) for faster setup of polished flows, but chose Auth.js backed directly by the Neon Postgres DB to avoid a third-party auth vendor/cost for what is a small site (one admin, lightweight optional customer accounts). Revisit if auth needs grow significantly (e.g. more social providers, org/team features) beyond what Auth.js comfortably covers.
