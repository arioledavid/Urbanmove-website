import type { Role } from "@prisma/client";

/** Admins may create, update, and delete job records. */
export function canEditJobs(role: Role): boolean {
  return role === "ADMIN";
}

/** @deprecated Use {@link canEditJobs}. Kept for existing call sites. */
export function canManageJobs(role: Role): boolean {
  return canEditJobs(role);
}

export function canTrackJobs(role: Role): boolean {
  return role === "ADMIN" || role === "DRIVER";
}

/** View or track a job: admins on any job; drivers only when assigned. */
export function canTrackJob(
  role: Role,
  userId: string,
  assignedStaffIds: string[],
): boolean {
  if (role === "ADMIN") return true;
  if (role === "DRIVER") return assignedStaffIds.includes(userId);
  return false;
}

export function canAccessJob(
  role: Role,
  userId: string,
  assignedStaffIds: string[],
): boolean {
  return canTrackJob(role, userId, assignedStaffIds);
}

/**
 * Paths a DRIVER may use on the admin host (after stripping any `/admin` prefix).
 * Jobs list + assigned job detail + settings. Not `/jobs/new`.
 */
export function isDriverAllowedPath(pathname: string): boolean {
  if (pathname === "/login" || pathname.startsWith("/login/")) return true;
  if (pathname === "/jobs") return true;
  if (
    pathname.startsWith("/jobs/") &&
    pathname !== "/jobs/new" &&
    !pathname.startsWith("/jobs/new/")
  ) {
    return true;
  }
  if (pathname === "/settings" || pathname.startsWith("/settings/")) {
    return true;
  }
  return false;
}
