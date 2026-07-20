/** Single ops timezone for admin calendar days and job scheduling. */
export const OPS_TIMEZONE = "Europe/London";

export type ZonedParts = {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
};

export function getZonedParts(
  date: Date,
  timeZone: string = OPS_TIMEZONE,
): ZonedParts {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);

  const num = (type: Intl.DateTimeFormatPartTypes) => {
    const value = parts.find((part) => part.type === type)?.value;
    return value ? Number(value) : 0;
  };

  return {
    year: num("year"),
    month: num("month"),
    day: num("day"),
    hour: num("hour"),
    minute: num("minute"),
    second: num("second"),
  };
}

/**
 * Interpret a civil date/time in the ops timezone as a UTC Instant.
 * Uses iterative offset correction so DST transitions stay correct.
 */
export function zonedLocalToUtc(
  year: number,
  month: number,
  day: number,
  hour = 0,
  minute = 0,
  second = 0,
  timeZone: string = OPS_TIMEZONE,
): Date {
  let utcMillis = Date.UTC(year, month - 1, day, hour, minute, second);

  for (let i = 0; i < 2; i++) {
    const parts = getZonedParts(new Date(utcMillis), timeZone);
    const shownAsUtc = Date.UTC(
      parts.year,
      parts.month - 1,
      parts.day,
      parts.hour,
      parts.minute,
      parts.second,
    );
    const desiredAsUtc = Date.UTC(year, month - 1, day, hour, minute, second);
    utcMillis += desiredAsUtc - shownAsUtc;
  }

  return new Date(utcMillis);
}

/** Monday = 0 … Sunday = 6 in the ops timezone. */
export function zonedWeekdayMon0(
  date: Date,
  timeZone: string = OPS_TIMEZONE,
): number {
  const weekday = new Intl.DateTimeFormat("en-US", {
    timeZone,
    weekday: "short",
  }).format(date);
  const map: Record<string, number> = {
    Mon: 0,
    Tue: 1,
    Wed: 2,
    Thu: 3,
    Fri: 4,
    Sat: 5,
    Sun: 6,
  };
  return map[weekday] ?? 0;
}

/** datetime-local value (`YYYY-MM-DDTHH:mm`) in the ops timezone. */
export function toOpsDateTimeLocalValue(
  value: Date | string | null | undefined,
): string {
  if (!value) return "";
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return "";
  const parts = getZonedParts(date);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${parts.year}-${pad(parts.month)}-${pad(parts.day)}T${pad(parts.hour)}:${pad(parts.minute)}`;
}

/** Default morning slot when only a move date (no time) is known. */
export const DEFAULT_SCHEDULE_HOUR = 9;
export const DEFAULT_SCHEDULE_MINUTE = 0;

export function isPastOpsDateTime(date: Date): boolean {
  return date.getTime() < Date.now();
}

/**
 * Turn an enquiry move date into a job scheduled start.
 * Courier keeps the requested time; other services default to 09:00 ops time.
 */
export function moveDateToScheduledStart(
  moveDate: Date,
  serviceType: "COURIER" | "REMOVAL" | "CARGO" | "OTHER",
): Date {
  const parts = getZonedParts(moveDate);
  if (serviceType === "COURIER") {
    return zonedLocalToUtc(
      parts.year,
      parts.month,
      parts.day,
      parts.hour,
      parts.minute,
    );
  }
  return zonedLocalToUtc(
    parts.year,
    parts.month,
    parts.day,
    DEFAULT_SCHEDULE_HOUR,
    DEFAULT_SCHEDULE_MINUTE,
  );
}

/** Parse `YYYY-MM-DDTHH:mm` as an ops-timezone wall clock → UTC Instant. */
export function parseOpsDateTimeLocal(value: string): Date | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const match =
    /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?$/.exec(trimmed);
  if (!match) return null;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const hour = Number(match[4]);
  const minute = Number(match[5]);
  const second = Number(match[6] ?? "0");

  const probe = new Date(Date.UTC(year, month - 1, day, hour, minute, second));
  if (
    probe.getUTCFullYear() !== year ||
    probe.getUTCMonth() !== month - 1 ||
    probe.getUTCDate() !== day ||
    probe.getUTCHours() !== hour ||
    probe.getUTCMinutes() !== minute ||
    probe.getUTCSeconds() !== second
  ) {
    return null;
  }

  return zonedLocalToUtc(year, month, day, hour, minute, second);
}
