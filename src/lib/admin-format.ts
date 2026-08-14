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

/** Formats minutes as "4h 15m", "4h", or "15m". */
/** Actual pickup time wins over the scheduled slot once Save Pickup has run. */
export function jobDisplayStart(job: {
  pickedUpAt?: Date | string | null;
  scheduledStart?: Date | string | null;
}): Date | string | null {
  return job.pickedUpAt ?? job.scheduledStart ?? null;
}

/** Actual drop-off time wins over the scheduled slot once drop-off is recorded. */
export function jobDisplayEnd(job: {
  droppedOffAt?: Date | string | null;
  scheduledEnd?: Date | string | null;
}): Date | string | null {
  return job.droppedOffAt ?? job.scheduledEnd ?? null;
}

export function formatDurationMinutes(
  minutes: number | null | undefined,
): string {
  if (minutes == null || !Number.isFinite(minutes) || minutes < 0) {
    return "—";
  }
  const total = Math.round(minutes);
  const hours = Math.floor(total / 60);
  const mins = total % 60;
  if (hours === 0) return `${mins}m`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}m`;
}
