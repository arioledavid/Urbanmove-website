import {
  getZonedParts,
  OPS_TIMEZONE,
  zonedLocalToUtc,
  zonedWeekdayMon0,
} from "@/lib/ops-time";

export type CalendarDay = {
  date: Date;
  inCurrentMonth: boolean;
  key: string;
};

export function startOfMonth(date: Date): Date {
  const parts = getZonedParts(date);
  return zonedLocalToUtc(parts.year, parts.month, 1);
}

export function addMonths(date: Date, delta: number): Date {
  const parts = getZonedParts(date);
  const probe = new Date(Date.UTC(parts.year, parts.month - 1 + delta, 1, 12));
  return zonedLocalToUtc(
    probe.getUTCFullYear(),
    probe.getUTCMonth() + 1,
    1,
  );
}

export function monthKey(date: Date): string {
  const parts = getZonedParts(date);
  const m = String(parts.month).padStart(2, "0");
  return `${parts.year}-${m}`;
}

export function parseMonthKey(value: string | undefined): Date {
  if (!value || !/^\d{4}-\d{2}$/.test(value)) {
    return startOfMonth(new Date());
  }
  const [y, m] = value.split("-").map(Number);
  return zonedLocalToUtc(y!, m!, 1);
}

export function dayKey(date: Date): string {
  const parts = getZonedParts(date);
  const m = String(parts.month).padStart(2, "0");
  const d = String(parts.day).padStart(2, "0");
  return `${parts.year}-${m}-${d}`;
}

/** Parse `YYYY-MM-DD` as an ops-timezone calendar day (midnight). */
export function parseDayKey(value: string | undefined): Date | null {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const [y, m, d] = value.split("-").map(Number);
  const probe = new Date(Date.UTC(y!, m! - 1, d!));
  if (
    probe.getUTCFullYear() !== y ||
    probe.getUTCMonth() !== m! - 1 ||
    probe.getUTCDate() !== d
  ) {
    return null;
  }
  return zonedLocalToUtc(y!, m!, d!);
}

export function addDays(date: Date, delta: number): Date {
  const parts = getZonedParts(date);
  const probe = new Date(
    Date.UTC(parts.year, parts.month - 1, parts.day + delta, 12),
  );
  return zonedLocalToUtc(
    probe.getUTCFullYear(),
    probe.getUTCMonth() + 1,
    probe.getUTCDate(),
  );
}

export function formatDayHeading(date: Date): string {
  return date.toLocaleDateString("en-GB", {
    timeZone: OPS_TIMEZONE,
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/** Monday-start month grid including leading/trailing days (ops timezone). */
export function buildMonthGrid(month: Date): CalendarDay[] {
  const first = startOfMonth(month);
  const monthParts = getZonedParts(first);
  const startOffset = zonedWeekdayMon0(first);
  const gridStart = addDays(first, -startOffset);

  const days: CalendarDay[] = [];
  for (let i = 0; i < 42; i++) {
    const date = addDays(gridStart, i);
    const parts = getZonedParts(date);
    days.push({
      date,
      inCurrentMonth:
        parts.year === monthParts.year && parts.month === monthParts.month,
      key: dayKey(date),
    });
  }
  return days;
}

export function dayBounds(date: Date): { start: Date; end: Date } {
  const parts = getZonedParts(date);
  const start = zonedLocalToUtc(parts.year, parts.month, parts.day);
  const end = addDays(start, 1);
  return { start, end };
}

export function jobTouchesDay(
  day: Date,
  scheduledStart: Date | null,
  scheduledEnd: Date | null,
): boolean {
  if (!scheduledStart) return false;
  const { start, end } = dayBounds(day);
  const jobEnd = scheduledEnd ?? scheduledStart;
  return scheduledStart < end && jobEnd > start;
}

export function formatMonthHeading(date: Date): string {
  return date.toLocaleDateString("en-GB", {
    timeZone: OPS_TIMEZONE,
    month: "long",
    year: "numeric",
  });
}
