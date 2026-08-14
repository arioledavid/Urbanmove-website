import type { Role } from "@prisma/client";
import { auth } from "@/auth";
import { canEditJobs, canTrackJobs } from "@/lib/admin-access";
import { err, ok, type Result } from "@/lib/result";

export type AdminActor = {
  id: string;
  role: Role;
  email: string;
};

export async function requireActiveSession(): Promise<Result<AdminActor>> {
  const session = await auth();
  if (!session?.user?.id || session.user.active === false) {
    return err("You must be signed in.");
  }
  return ok({
    id: session.user.id,
    role: session.user.role,
    email: session.user.email,
  });
}

export async function requireTrackingSession(): Promise<Result<AdminActor>> {
  const actor = await requireActiveSession();
  if (!actor.success) return actor;
  if (!canTrackJobs(actor.data.role)) {
    return err("You must be signed in.");
  }
  return actor;
}

export async function requireEditSession(): Promise<Result<AdminActor>> {
  const actor = await requireActiveSession();
  if (!actor.success) return actor;
  if (!canEditJobs(actor.data.role)) {
    return err("You do not have access to edit jobs.");
  }
  return actor;
}
