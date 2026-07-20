import type { JobStatus, ServiceType } from "@prisma/client";
import {
  OPS_TIMEZONE,
  toOpsDateTimeLocalValue,
} from "@/lib/ops-time";

export const SERVICE_TYPE_LABELS: Record<ServiceType, string> = {
  REMOVAL: "Removal",
  COURIER: "Courier",
  CARGO: "Cargo",
  OTHER: "Other",
};

export const JOB_STATUS_LABELS: Record<JobStatus, string> = {
  DRAFT: "Draft",
  SCHEDULED: "Scheduled",
  IN_PROGRESS: "In progress",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

export function formatAdminDate(value: Date | string | null | undefined): string {
  if (!value) return "—";
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-GB", {
    timeZone: OPS_TIMEZONE,
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatAdminDateTime(
  value: Date | string | null | undefined,
): string {
  if (!value) return "—";
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString("en-GB", {
    timeZone: OPS_TIMEZONE,
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** datetime-local input value in the ops timezone (Europe/London). */
export function toDateTimeLocalValue(
  value: Date | string | null | undefined,
): string {
  return toOpsDateTimeLocalValue(value);
}
