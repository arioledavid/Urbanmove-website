import type { JobStatus } from "@prisma/client";

/** Main happy-path sequence. */
export const JOB_MAIN_PATH: JobStatus[] = [
  "DRAFT",
  "SCHEDULED",
  "IN_PROGRESS",
  "COMPLETED",
];

/**
 * Transition rules (one-step-forward on the main path):
 * - Forward: only the next step on the main path.
 * - Side exit: CANCELLED from any status before COMPLETED.
 * - Reopen: CANCELLED → DRAFT only (no other backward moves).
 * - COMPLETED is terminal.
 */
export function getAllowedJobTransitions(current: JobStatus): JobStatus[] {
  if (current === "CANCELLED") {
    return ["DRAFT"];
  }

  if (current === "COMPLETED") {
    return [];
  }

  const idx = JOB_MAIN_PATH.indexOf(current);
  if (idx === -1) return [];

  const allowed: JobStatus[] = [];

  if (idx < JOB_MAIN_PATH.length - 1) {
    allowed.push(JOB_MAIN_PATH[idx + 1]!);
  }

  allowed.push("CANCELLED");

  return allowed;
}

export function isJobTransitionAllowed(
  from: JobStatus,
  to: JobStatus,
): boolean {
  return getAllowedJobTransitions(from).includes(to);
}

/** Finished jobs can be removed from the system. */
export function canDeleteJob(status: JobStatus): boolean {
  return status === "COMPLETED";
}
