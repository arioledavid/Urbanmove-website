import type { NextAuthConfig } from "next-auth";
import type { Role } from "@prisma/client";

/**
 * Proxy-safe Auth.js config (ADR 002).
 * No Prisma, no bcrypt, no Credentials authorize — JWT decode/validate only.
 */
export const authConfig = {
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 8 * 60 * 60,
    updateAge: 30 * 60,
  },
  providers: [],
  callbacks: {
    // Always allow through Auth.js middleware. Host routing + auth gating live
    // in proxy.ts. An authorized() deny redirects Server Action POSTs to /login
    // before the action runs (which looked like "Mark as Contacted" doing nothing).
    authorized() {
      return true;
    },
    jwt({ token }) {
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub ?? "";
        session.user.email = typeof token.email === "string" ? token.email : "";
        session.user.role = token.role as Role;
        session.user.active = token.active !== false;
      }
      return session;
    },
  },
  trustHost: true,
} satisfies NextAuthConfig;
