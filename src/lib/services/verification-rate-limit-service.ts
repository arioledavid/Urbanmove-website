import { prisma } from "@/lib/db/prisma";
import { err, ok, type Result } from "@/lib/result";

const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 8;
const LOCK_MS = 15 * 60 * 1000;

/** Per job + actor key so one bad actor cannot lock an entire job for everyone. */
export function verificationAttemptKey(jobId: string, actorId: string): string {
  return `job-code:${jobId}:${actorId}`;
}

/**
 * Rate-limits customer code verification attempts using the LoginAttempt store.
 * Same shape as login throttling; key prefix keeps the namespaces separate.
 */
export const verificationRateLimitService = {
  async check(
    key: string,
  ): Promise<
    Result<{ allowed: true } | { allowed: false; retryAfterSec: number }>
  > {
    try {
      const row = await prisma.loginAttempt.findUnique({ where: { key } });
      if (!row?.lockedUntil) {
        return ok({ allowed: true });
      }

      const now = Date.now();
      if (row.lockedUntil.getTime() > now) {
        return ok({
          allowed: false,
          retryAfterSec: Math.ceil((row.lockedUntil.getTime() - now) / 1000),
        });
      }

      return ok({ allowed: true });
    } catch (error) {
      console.error("verificationRateLimitService.check failed:", error);
      return err("Unable to verify rate limit.");
    }
  },

  async recordFailure(key: string): Promise<Result<{ locked: boolean }>> {
    const now = new Date();

    try {
      const existing = await prisma.loginAttempt.findUnique({ where: { key } });

      if (
        !existing ||
        now.getTime() - existing.windowStart.getTime() > WINDOW_MS
      ) {
        await prisma.loginAttempt.upsert({
          where: { key },
          create: {
            key,
            attempts: 1,
            windowStart: now,
            lastAttemptAt: now,
            lockedUntil: null,
          },
          update: {
            attempts: 1,
            windowStart: now,
            lastAttemptAt: now,
            lockedUntil: null,
          },
        });
        return ok({ locked: false });
      }

      const attempts = existing.attempts + 1;
      const locked = attempts >= MAX_ATTEMPTS;
      await prisma.loginAttempt.update({
        where: { key },
        data: {
          attempts,
          lastAttemptAt: now,
          lockedUntil: locked ? new Date(now.getTime() + LOCK_MS) : null,
        },
      });

      return ok({ locked });
    } catch (error) {
      console.error("verificationRateLimitService.recordFailure failed:", error);
      return err("Unable to record verification attempt.");
    }
  },

  async reset(key: string): Promise<Result<{ cleared: true }>> {
    try {
      await prisma.loginAttempt.deleteMany({ where: { key } });
      return ok({ cleared: true });
    } catch (error) {
      console.error("verificationRateLimitService.reset failed:", error);
      return err("Unable to clear verification attempts.");
    }
  },
};
