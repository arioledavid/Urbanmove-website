import Link from "next/link";
import type { JobStatus } from "@prisma/client";
import { PageHeader } from "@/components/admin/page-header";
import { StatusBadge, jobStatusTone } from "@/components/admin/status-badge";
import {
  formatAdminDateTime,
  JOB_STATUS_LABELS,
  SERVICE_TYPE_LABELS,
} from "@/lib/admin-format";
import { jobService } from "@/lib/services/job-service";

export const metadata = { title: "Jobs" };

const FILTER_STATUSES: Array<JobStatus | "ALL"> = [
  "ALL",
  "DRAFT",
  "SCHEDULED",
  "IN_PROGRESS",
  "COMPLETED",
  "CANCELLED",
];

type JobsPageProps = {
  searchParams: Promise<{ status?: string }>;
};

export default async function JobsPage({ searchParams }: JobsPageProps) {
  const params = await searchParams;
  const statusParam = (params.status ?? "ALL") as JobStatus | "ALL";
  const status = FILTER_STATUSES.includes(statusParam) ? statusParam : "ALL";

  const result = await jobService.list({ status });
  const jobs = result.success ? result.data : [];
  const unscheduled = jobs.filter((job) => !job.scheduledStart);
  const scheduled = jobs.filter((job) => job.scheduledStart);

  return (
    <div>
      <PageHeader
        title="Jobs"
        description="Scheduled work. Unscheduled jobs need dispatcher attention — set start/end to appear on the calendar."
      />

      <form className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="sm:w-56">
          <label
            htmlFor="status"
            className="mb-1 block text-xs font-medium text-muted"
          >
            Status
          </label>
          <select
            id="status"
            name="status"
            defaultValue={status}
            className="h-11 w-full rounded-md border border-border bg-paper px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 sm:h-10"
          >
            {FILTER_STATUSES.map((value) => (
              <option key={value} value={value}>
                {value === "ALL" ? "All statuses" : JOB_STATUS_LABELS[value]}
              </option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          className="inline-flex h-11 items-center justify-center rounded-md bg-ink px-4 text-sm font-medium text-paper transition-transform duration-150 ease-out active:scale-[0.97] sm:h-10 [@media(hover:hover)_and_(pointer:fine)]:hover:bg-secondary-hover"
        >
          Apply
        </button>
      </form>

      {!result.success ? (
        <p className="text-sm text-primary" role="alert">
          {result.error}
        </p>
      ) : jobs.length === 0 ? (
        <div className="rounded-lg border border-border bg-paper px-4 py-10 text-sm text-muted">
          No jobs yet. Convert a Deposit Paid enquiry to create the first job.
        </div>
      ) : (
        <div className="space-y-6">
          {unscheduled.length > 0 ? (
            <section>
              <h2 className="mb-2 text-sm font-semibold text-ink">
                Unscheduled ({unscheduled.length})
              </h2>
              <JobsList jobs={unscheduled} />
            </section>
          ) : null}

          <section>
            <h2 className="mb-2 text-sm font-semibold text-ink">
              Scheduled ({scheduled.length})
            </h2>
            {scheduled.length === 0 ? (
              <p className="rounded-lg border border-border bg-paper px-4 py-6 text-sm text-muted">
                No scheduled jobs in this filter.
              </p>
            ) : (
              <JobsList jobs={scheduled} />
            )}
          </section>
        </div>
      )}
    </div>
  );
}

type JobRow = {
  id: string;
  reference: string;
  title: string;
  status: JobStatus;
  serviceType: keyof typeof SERVICE_TYPE_LABELS;
  scheduledStart: Date | null;
  scheduledEnd: Date | null;
};

function JobsList({ jobs }: { jobs: JobRow[] }) {
  return (
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
                  <p className="mt-0.5 truncate text-sm text-ink">{job.title}</p>
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
  );
}
