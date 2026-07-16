export type CalendarDay = {
  date: Date;
  inCurrentMonth: boolean;
  key: string;
};

export function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export function addMonths(date: Date, delta: number): Date {
  return new Date(date.getFullYear(), date.getMonth() + delta, 1);
}

export function monthKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

export function parseMonthKey(value: string | undefined): Date {
  if (!value || !/^\d{4}-\d{2}$/.test(value)) {
    return startOfMonth(new Date());
  }
  const [y, m] = value.split("-").map(Number);
  return new Date(y!, m! - 1, 1);
}

/** Monday-start month grid including leading/trailing days. */
export function buildMonthGrid(month: Date): CalendarDay[] {
  const first = startOfMonth(month);
  const startOffset = (first.getDay() + 6) % 7; // Monday = 0
  const gridStart = new Date(first);
  gridStart.setDate(first.getDate() - startOffset);

  const days: CalendarDay[] = [];
  for (let i = 0; i < 42; i++) {
    const date = new Date(gridStart);
    date.setDate(gridStart.getDate() + i);
    days.push({
      date,
      inCurrentMonth: date.getMonth() === month.getMonth(),
      key: `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`,
    });
  }
  return days;
}

export function dayBounds(date: Date): { start: Date; end: Date } {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);
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
  return date.toLocaleDateString("en-GB", { month: "long", year: "numeric" });
}
