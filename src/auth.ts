import { compare } from "bcryptjs";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import type { Role } from "@prisma/client";
import { authConfig } from "@/auth.config";
import { prisma } from "@/lib/db/prisma";
import { activityService } from "@/lib/services/activity-service";
import {
  loginAttemptKey,
  loginRateLimitService,
} from "@/lib/services/login-rate-limit-service";

const MIN_PASSWORD_LENGTH = 12;

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        clientIp: { label: "IP", type: "text" },
      },
      async authorize(credentials) {
        const email =
          typeof credentials?.email === "string"
            ? credentials.email.trim().toLowerCase()
            : "";
        const password =
          typeof credentials?.password === "string" ? credentials.password : "";
        const clientIp =
          typeof credentials?.clientIp === "string"
            ? credentials.clientIp
            : "unknown";

        if (!email || !password || password.length < MIN_PASSWORD_LENGTH) {
          return null;
        }

        const key = loginAttemptKey(clientIp, email);
        const rate = await loginRateLimitService.check(key);
        if (!rate.success) return null;
        if (!rate.data.allowed) return null;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user?.passwordHash || !user.active) {
          await loginRateLimitService.recordFailure(key);
          if (user?.id) {
            await activityService.log({
              type: "LOGIN_FAILURE",
              entityType: "User",
              entityId: user.id,
              entityReference: user.email,
              message: `Failed login for ${email}`,
              metadata: { email, reason: "invalid_or_inactive" },
            });
          }
          return null;
        }

        const valid = await compare(password, user.passwordHash);
        if (!valid) {
          await loginRateLimitService.recordFailure(key);
          await activityService.log({
            type: "LOGIN_FAILURE",
            entityType: "User",
            entityId: user.id,
            entityReference: user.email,
            message: `Failed login for ${email}`,
            metadata: { email, reason: "bad_password" },
          });
          return null;
        }

        await loginRateLimitService.reset(key);
        await activityService.log({
          type: "LOGIN_SUCCESS",
          entityType: "User",
          entityId: user.id,
          entityReference: user.email,
          message: `User ${user.email} signed in`,
          actorId: user.id,
        });

        return {
          id: user.id,
          email: user.email,
          role: user.role,
          active: user.active,
        };
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    async jwt({ token, user, trigger }) {
      if (user) {
        token.sub = user.id;
        token.email = user.email;
        token.role = user.role as Role;
        token.active = user.active;
        return token;
      }

      if (token.sub && (trigger === "update" || token.iat)) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.sub },
          select: {
            email: true,
            role: true,
            active: true,
            passwordChangedAt: true,
          },
        });

        if (!dbUser || !dbUser.active) {
          token.active = false;
          return token;
        }

        // iat is second-precision; compare in seconds to avoid false invalidation
        // when passwordChangedAt has sub-second milliseconds.
        const passwordChangedAtSec = Math.floor(
          dbUser.passwordChangedAt.getTime() / 1000,
        );
        if (
          typeof token.iat === "number" &&
          token.iat < passwordChangedAtSec
        ) {
          token.active = false;
          return token;
        }

        token.email = dbUser.email;
        token.role = dbUser.role;
        token.active = dbUser.active;
      }

      return token;
    },
    session({ session, token }) {
      session.user = {
        ...session.user,
        id: token.sub ?? "",
        email: typeof token.email === "string" ? token.email : "",
        role: token.role as Role,
        active: token.active !== false,
      };
      return session;
    },
  },
});
