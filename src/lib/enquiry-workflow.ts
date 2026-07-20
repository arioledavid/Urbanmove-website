import type { EnquiryStatus } from "@prisma/client";

/** Main happy-path sequence (ADR 005). */
export const ENQUIRY_MAIN_PATH: EnquiryStatus[] = [
  "NEW",
  "CONTACTED",
  "QUOTE_SENT",
  "ACCEPTED",
  "DEPOSIT_PAID",
  "JOB_CREATED",
  "SCHEDULED",
  "COMPLETED",
];

/**
 * Statuses after Convert to Job. Kept on the enquiry record for reporting,
 * but hidden from the enquiries list (work continues under Jobs).
 */
export const ENQUIRY_CONVERTED_STATUSES: EnquiryStatus[] = [
  "JOB_CREATED",
  "SCHEDULED",
  "COMPLETED",
];

/** Statuses still worked in the Enquiries inbox. */
export const ENQUIRY_LIST_STATUSES: EnquiryStatus[] = [
  "NEW",
  "CONTACTED",
  "QUOTE_SENT",
  "ACCEPTED",
  "DEPOSIT_PAID",
  "LOST",
  "SPAM",
];

export const ENQUIRY_STATUS_LABELS: Record<EnquiryStatus, string> = {
  NEW: "New",
  CONTACTED: "Contacted",
  QUOTE_SENT: "Quote Sent",
  ACCEPTED: "Accepted",
  DEPOSIT_PAID: "Deposit Paid",
  JOB_CREATED: "Job Created",
  SCHEDULED: "Scheduled",
  COMPLETED: "Completed",
  LOST: "Lost",
  SPAM: "Spam",
};

/**
 * Transition rules (Phase 1):
 * - Forward: only the next step on the main path.
 * - Side exits: LOST / SPAM from any status before JOB_CREATED.
 * - Reopen: LOST / SPAM → CONTACTED only (no other backward moves).
 * - JOB_CREATED → SCHEDULED → COMPLETED are driven by job scheduling/completion
 *   (services may advance enquiry when the linked job changes); staff cannot
 *   manually jump those from the enquiry workflow control.
 */
export function getAllowedEnquiryTransitions(
  current: EnquiryStatus,
): EnquiryStatus[] {
  if (current === "LOST" || current === "SPAM") {
    return ["CONTACTED"];
  }

  if (current === "COMPLETED") {
    return [];
  }

  const idx = ENQUIRY_MAIN_PATH.indexOf(current);
  if (idx === -1) return [];

  const allowed: EnquiryStatus[] = [];

  // Staff-driven forward steps stop at DEPOSIT_PAID; job conversion / job
  // updates advance JOB_CREATED → SCHEDULED → COMPLETED.
  if (current === "DEPOSIT_PAID") {
    // Convert to Job is a separate action; no manual status advance here.
  } else if (idx < ENQUIRY_MAIN_PATH.indexOf("DEPOSIT_PAID")) {
    allowed.push(ENQUIRY_MAIN_PATH[idx + 1]!);
  }

  const preJobCreated = idx < ENQUIRY_MAIN_PATH.indexOf("JOB_CREATED");
  if (preJobCreated) {
    allowed.push("LOST", "SPAM");
  }

  return allowed;
}

export function isEnquiryTransitionAllowed(
  from: EnquiryStatus,
  to: EnquiryStatus,
): boolean {
  return getAllowedEnquiryTransitions(from).includes(to);
}
