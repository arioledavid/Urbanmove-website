import Link from "next/link";
import { notFound } from "next/navigation";
import { DayDateFilter } from "@/components/admin/day-date-filter";
import { PageHeader } from "@/components/admin/page-header";
import { StatusBadge, jobStatusTone } from "@/components/admin/status-badge";
import {
  formatAdminDateTime,
  JOB_STATUS_LABELS,
  SERVICE_TYPE_LABELS,
} from "@/lib/admin-format";
import {
  addDays,
  dayBounds,
  dayKey,
  formatDayHeading,
  monthKey,
  parseDayKey,
} from "@/lib/calendar-month";
import { jobService } from "@/lib/services/job-service";

type CalendarDayPageProps = {
  params: Promise<{ date: string }>;
};

export async function generateMetadata({ params }: CalendarDayPageProps) {
  const { date: dateParam } = await params;
  const day = parseDayKey(dateParam);
  if (!day) return { title: "Day" };
  return { title: formatDayHeading(day) };
}

export default async function CalendarDayPage({ params }: CalendarDayPageProps) {
  const { date: dateParam } = await params;
  const day = parseDayKey(dateParam);
  if (!day) notFound();

  const prev = addDays(day, -1);
  const next = addDays(day, 1);
  const today = dayBounds(new Date()).start;

  const result = await jobService.listForDay(day);
  const jobs = result.success ? result.data : [];

  return (
    <div>
      <PageHeader
        title={formatDayHeading(day)}
        description="Jobs scheduled for this day, earliest first. Open a job to view or edit details."
        actions={
          <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
            <Link
              href={`/calendar?month=${monthKey(day)}`}
              className="inline-flex h-11 flex-1 items-center justify-center rounded-md border border-border px-3 text-sm font-medium text-ink transition-transform duration-150 ease-out active:scale-[0.97] sm:h-9 sm:flex-none [@media(hover:hover)_and_(pointer:fine)]:hover:bg-surface"
            >
              Back to month
            </Link>
            <Link
              href={`/calendar/${dayKey(prev)}`}
              className="inline-flex h-11 items-center justify-center rounded-md border border-border px-3 text-sm font-medium text-ink transition-transform duration-150 ease-out active:scale-[0.97] sm:h-9 [@media(hover:hover)_and_(pointer:fine)]:hover:bg-surface"
            >
              Previous
            </Link>
            <Link
              href={`/calendar/${dayKey(today)}`}
              className="inline-flex h-11 items-center justify-center rounded-md border border-border px-3 text-sm font-medium text-ink transition-transform duration-150 ease-out active:scale-[0.97] sm:h-9 [@media(hover:hover)_and_(pointer:fine)]:hover:bg-surface"
            >
              Today
            </Link>
            <Link
              href={`/calendar/${dayKey(next)}`}
              className="inline-flex h-11 items-center justify-center rounded-md border border-border px-3 text-sm font-medium text-ink transition-transform duration-150 ease-out active:scale-[0.97] sm:h-9 [@media(hover:hover)_and_(pointer:fine)]:hover:bg-surface"
            >
              Next
            </Link>
          </div>
        }
      />

      <div className="mb-4">
        <DayDateFilter value={dayKey(day)} />
      </div>

      {!result.success ? (
        <p className="text-sm text-primary" role="alert">
          {result.error}
        </p>
      ) : jobs.length === 0 ? (
        <div className="rounded-lg border border-border bg-paper px-4 py-10 text-sm text-muted">
          No jobs scheduled for this day.
        </div>
      ) : (
        <>
          <ul className="space-y-3 md:hidden">
            {jobs.map((job) => (
              <li key={job.id}>
                <Link
                  href={`/jobs/${job.reference}`}
                  className="block rounded-lg border border-border bg-paper p-4 transition-[transform,border-color] duration-150 ease-out active:scale-[0.99] [@media(hover:hover)_and_(pointer:fine)]:hover:border-primary/40"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-medium text-primary">{job.reference}</p>
                      <p className="mt-0.5 truncate text-sm text-ink">
                        {job.title}
                      </p>
                      <p className="mt-0.5 text-xs text-muted">
                        {job.enquiry.contactName}
                      </p>
                    </div>
                    <StatusBadge
                      label={JOB_STATUS_LABELS[job.status]}
                      tone={jobStatusTone(job.status)}
                    />
                  </div>
                  <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2 text-xs">
                    <div>
                      <dt className="text-muted">Service</dt>
                      <dd className="text-ink">
                        {SERVICE_TYPE_LABELS[job.serviceType]}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-muted">Start</dt>
                      <dd className="text-ink">
                        {formatAdminDateTime(job.scheduledStart)}
                      </dd>
                    </div>
                    <div className="col-span-2">
                      <dt className="text-muted">End</dt>
                      <dd className="text-ink">
                        {formatAdminDateTime(job.scheduledEnd)}
                      </dd>
                    </div>
                  </dl>
                </Link>
              </li>
            ))}
          </ul>

          <div className="hidden overflow-x-auto rounded-lg border border-border bg-paper md:block">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-border bg-surface text-xs tracking-wide text-muted uppercase">
                <tr>
                  <th className="px-4 py-3 font-medium">Reference</th>
                  <th className="px-4 py-3 font-medium">Title</th>
                  <th className="px-4 py-3 font-medium">Contact</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Service</th>
                  <th className="px-4 py-3 font-medium">Start</th>
                  <th className="px-4 py-3 font-medium">End</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {jobs.map((job) => (
                  <tr
                    key={job.id}
                    className="[@media(hover:hover)_and_(pointer:fine)]:hover:bg-surface/80"
                  >
                    <td className="px-4 py-3">
                      <Link
                        href={`/jobs/${job.reference}`}
                        className="font-medium text-primary [@media(hover:hover)_and_(pointer:fine)]:hover:underline"
                      >
                        {job.reference}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-ink">{job.title}</td>
                    <td className="px-4 py-3 text-muted">
                      {job.enquiry.contactName}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge
                        label={JOB_STATUS_LABELS[job.status]}
                        tone={jobStatusTone(job.status)}
                      />
                    </td>
                    <td className="px-4 py-3 text-muted">
                      {SERVICE_TYPE_LABELS[job.serviceType]}
                    </td>
                    <td className="px-4 py-3 text-muted">
                      {formatAdminDateTime(job.scheduledStart)}
                    </td>
                    <td className="px-4 py-3 text-muted">
                      {formatAdminDateTime(job.scheduledEnd)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
