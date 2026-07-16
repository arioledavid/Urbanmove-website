import Link from "next/link";
import { PageHeader } from "@/components/admin/page-header";
import { StatusBadge, jobStatusTone } from "@/components/admin/status-badge";
import { JOB_STATUS_LABELS } from "@/lib/admin-format";
import {
  addMonths,
  buildMonthGrid,
  formatMonthHeading,
  jobTouchesDay,
  monthKey,
  parseMonthKey,
  startOfMonth,
} from "@/lib/calendar-month";
import { cn } from "@/lib/utils";
import { jobService } from "@/lib/services/job-service";

export const metadata = { title: "Calendar" };

type CalendarPageProps = {
  searchParams: Promise<{ month?: string }>;
};

export default async function CalendarPage({ searchParams }: CalendarPageProps) {
  const params = await searchParams;
  const month = startOfMonth(parseMonthKey(params.month));
  const prev = addMonths(month, -1);
  const next = addMonths(month, 1);

  const rangeStart = buildMonthGrid(month)[0]!.date;
  const rangeEnd = new Date(buildMonthGrid(month)[41]!.date);
  rangeEnd.setDate(rangeEnd.getDate() + 1);

  const jobsResult = await jobService.listInRange(rangeStart, rangeEnd);
  const jobs = jobsResult.success ? jobsResult.data : [];
  const days = buildMonthGrid(month);

  return (
    <div>
      <PageHeader
        title="Calendar"
        description="Read-only projection of job schedules. Use this to spot double-bookings before confirming crews."
        actions={
          <div className="flex items-center gap-2">
            <Link
              href={`/calendar?month=${monthKey(prev)}`}
              className="inline-flex h-9 items-center rounded-md border border-border px-3 text-sm font-medium text-ink hover:bg-surface"
            >
              Previous
            </Link>
            <Link
              href={`/calendar?month=${monthKey(startOfMonth(new Date()))}`}
              className="inline-flex h-9 items-center rounded-md border border-border px-3 text-sm font-medium text-ink hover:bg-surface"
            >
              Today
            </Link>
            <Link
              href={`/calendar?month=${monthKey(next)}`}
              className="inline-flex h-9 items-center rounded-md border border-border px-3 text-sm font-medium text-ink hover:bg-surface"
            >
              Next
            </Link>
          </div>
        }
      />

      <h2 className="mb-3 text-lg font-semibold text-ink">
        {formatMonthHeading(month)}
      </h2>

      {!jobsResult.success ? (
        <p className="text-sm text-primary" role="alert">
          {jobsResult.error}
        </p>
      ) : null}

      <div className="overflow-x-auto rounded-lg border border-border bg-paper">
        <div className="grid min-w-[720px] grid-cols-7 border-b border-border bg-surface text-center text-xs font-medium tracking-wide text-muted uppercase">
          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((label) => (
            <div key={label} className="px-2 py-2">
              {label}
            </div>
          ))}
        </div>

        <div className="grid min-w-[720px] grid-cols-7">
          {days.map((day) => {
            const dayJobs = jobs.filter((job) =>
              jobTouchesDay(day.date, job.scheduledStart, job.scheduledEnd),
            );
            const hasOverlap = dayJobs.length > 1;

            return (
              <div
                key={day.key}
                className={cn(
                  "min-h-28 border-r border-b border-border p-1.5 last:border-r-0",
                  !day.inCurrentMonth && "bg-surface/50",
                  hasOverlap && day.inCurrentMonth && "bg-[#FFF8E6]",
                )}
              >
                <div className="mb-1 flex items-center justify-between">
                  <span
                    className={cn(
                      "text-xs font-medium",
                      day.inCurrentMonth ? "text-ink" : "text-subtle",
                    )}
                  >
                    {day.date.getDate()}
                  </span>
                  {hasOverlap ? (
                    <span className="text-[10px] font-medium text-[#8A6D00]">
                      {dayJobs.length} jobs
                    </span>
                  ) : null}
                </div>

                <ul className="space-y-1">
                  {dayJobs.map((job) => (
                    <li key={job.id}>
                      <Link
                        href={`/jobs/${job.reference}`}
                        className="block rounded border border-border bg-paper px-1.5 py-1 hover:border-primary"
                      >
                        <p className="truncate text-[11px] font-medium text-ink">
                          {job.reference}
                        </p>
                        <p className="truncate text-[10px] text-muted">
                          {job.title}
                        </p>
                        <div className="mt-0.5">
                          <StatusBadge
                            label={JOB_STATUS_LABELS[job.status]}
                            tone={jobStatusTone(job.status)}
                            className="scale-90 origin-left"
                          />
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>

      <p className="mt-3 text-xs text-subtle">
        Days with more than one job are highlighted. Overlaps are warnings, not
        hard blocks — different crews may run in parallel.
      </p>
    </div>
  );
}
