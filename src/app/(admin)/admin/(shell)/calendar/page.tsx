import Link from "next/link";
import { PageHeader } from "@/components/admin/page-header";
import {
  addDays,
  addMonths,
  buildMonthGrid,
  dayKey,
  formatMonthHeading,
  jobTouchesDay,
  monthKey,
  parseMonthKey,
  startOfMonth,
} from "@/lib/calendar-month";
import { cn } from "@/lib/utils";
import { jobService } from "@/lib/services/job-service";

export const metadata = { title: "Calendar" };

const MAX_VISIBLE_JOBS = 3;

type CalendarPageProps = {
  searchParams: Promise<{ month?: string }>;
};

export default async function CalendarPage({ searchParams }: CalendarPageProps) {
  const params = await searchParams;
  const month = startOfMonth(parseMonthKey(params.month));
  const prev = addMonths(month, -1);
  const next = addMonths(month, 1);

  const days = buildMonthGrid(month);
  const rangeStart = days[0]!.date;
  const rangeEnd = addDays(days[41]!.date, 1);

  const jobsResult = await jobService.listInRange(rangeStart, rangeEnd);
  const jobs = jobsResult.success ? jobsResult.data : [];
  const todayKey = dayKey(new Date());

  return (
    <div>
      <PageHeader
        title="Calendar"
        description="Pick a day to review that day's jobs. Use the day list to open job details."
        actions={
          <div className="flex w-full items-center gap-2 sm:w-auto">
            <Link
              href={`/calendar?month=${monthKey(prev)}`}
              className="inline-flex h-11 flex-1 items-center justify-center rounded-md border border-border px-3 text-sm font-medium text-ink transition-transform duration-150 ease-out active:scale-[0.97] sm:h-9 sm:flex-none [@media(hover:hover)_and_(pointer:fine)]:hover:bg-surface"
            >
              Previous
            </Link>
            <Link
              href={`/calendar?month=${monthKey(startOfMonth(new Date()))}`}
              className="inline-flex h-11 flex-1 items-center justify-center rounded-md border border-border px-3 text-sm font-medium text-ink transition-transform duration-150 ease-out active:scale-[0.97] sm:h-9 sm:flex-none [@media(hover:hover)_and_(pointer:fine)]:hover:bg-surface"
            >
              Today
            </Link>
            <Link
              href={`/calendar?month=${monthKey(next)}`}
              className="inline-flex h-11 flex-1 items-center justify-center rounded-md border border-border px-3 text-sm font-medium text-ink transition-transform duration-150 ease-out active:scale-[0.97] sm:h-9 sm:flex-none [@media(hover:hover)_and_(pointer:fine)]:hover:bg-surface"
            >
              Next
            </Link>
          </div>
        }
      />

      <h2 className="mb-3 text-lg font-semibold text-balance text-ink">
        {formatMonthHeading(month)}
      </h2>

      {!jobsResult.success ? (
        <p className="text-sm text-primary" role="alert">
          {jobsResult.error}
        </p>
      ) : null}

      <div className="overflow-hidden rounded-lg border border-border bg-paper">
        <div className="grid grid-cols-7 border-b border-border bg-surface text-center text-[10px] font-medium tracking-wide text-muted uppercase sm:text-xs">
          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((label) => (
            <div key={label} className="px-0.5 py-2 sm:px-2">
              <span className="sm:hidden">{label.slice(0, 1)}</span>
              <span className="hidden sm:inline">{label}</span>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7">
          {days.map((day) => {
            const dayJobs = jobs.filter((job) =>
              jobTouchesDay(day.date, job.scheduledStart, job.scheduledEnd),
            );
            const visibleJobs = dayJobs.slice(0, MAX_VISIBLE_JOBS);
            const hiddenCount = dayJobs.length - visibleJobs.length;
            const hasOverlap = dayJobs.length > 1;
            const isToday = day.key === todayKey;

            return (
              <Link
                key={day.key}
                href={`/calendar/${dayKey(day.date)}`}
                className={cn(
                  "min-h-14 border-r border-b border-border p-1 transition-[background-color,transform] duration-150 ease-out last:border-r-0 active:scale-[0.98] sm:min-h-28 sm:p-1.5 [@media(hover:hover)_and_(pointer:fine)]:hover:bg-surface/80",
                  !day.inCurrentMonth && "bg-surface/50",
                  hasOverlap && day.inCurrentMonth && "bg-[#FFF8E6]",
                )}
              >
                <div className="mb-0.5 flex items-center justify-between gap-0.5 sm:mb-1">
                  <span
                    className={cn(
                      "inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium sm:h-auto sm:w-auto sm:rounded-none",
                      day.inCurrentMonth ? "text-ink" : "text-subtle",
                      isToday && "bg-primary text-paper sm:bg-transparent sm:text-primary sm:underline sm:decoration-2",
                    )}
                  >
                    {day.date.getDate()}
                  </span>
                  {hasOverlap ? (
                    <span className="hidden text-[10px] font-medium text-[#8A6D00] sm:inline">
                      {dayJobs.length} jobs
                    </span>
                  ) : null}
                </div>

                {/* Mobile: compact job count dots */}
                {dayJobs.length > 0 ? (
                  <div className="mt-1 flex flex-wrap justify-center gap-0.5 sm:hidden">
                    {visibleJobs.map((job) => (
                      <span
                        key={job.id}
                        className="h-1.5 w-1.5 rounded-full bg-primary"
                        aria-hidden
                      />
                    ))}
                    {hiddenCount > 0 ? (
                      <span className="text-[9px] font-medium text-muted">
                        +{hiddenCount}
                      </span>
                    ) : null}
                  </div>
                ) : null}
                {dayJobs.length > 0 ? (
                  <span className="sr-only">
                    {dayJobs.length} job{dayJobs.length === 1 ? "" : "s"}
                  </span>
                ) : null}

                {/* Desktop: up to 3 job chips; open the day for the rest */}
                <ul className="hidden space-y-1 sm:block">
                  {visibleJobs.map((job) => (
                    <li key={job.id}>
                      <div className="rounded border border-border bg-paper px-1.5 py-1">
                        <p className="truncate text-[11px] font-medium text-ink">
                          {job.reference}
                        </p>
                        <p className="truncate text-[10px] text-muted">
                          {job.title}
                        </p>
                      </div>
                    </li>
                  ))}
                  {hiddenCount > 0 ? (
                    <li className="px-0.5 pt-0.5 text-[10px] font-medium text-muted">
                      +{hiddenCount} more
                    </li>
                  ) : null}
                </ul>
              </Link>
            );
          })}
        </div>
      </div>

      <p className="mt-3 text-xs text-subtle text-pretty">
        Tap a day to open its job list. Days with more than one job are
        highlighted. Overlaps are warnings, not hard blocks — different crews
        may run in parallel.
      </p>
    </div>
  );
}
