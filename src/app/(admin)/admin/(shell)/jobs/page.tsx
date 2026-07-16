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
            className="h-10 w-full rounded-md border border-border bg-paper px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
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
          className="inline-flex h-10 items-center justify-center rounded-md bg-ink px-4 text-sm font-medium text-paper hover:bg-secondary-hover"
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
              <JobsTable jobs={unscheduled} />
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
              <JobsTable jobs={scheduled} />
            )}
          </section>
        </div>
      )}
    </div>
  );
}

function JobsTable({
  jobs,
}: {
  jobs: Array<{
    id: string;
    reference: string;
    title: string;
    status: JobStatus;
    serviceType: keyof typeof SERVICE_TYPE_LABELS;
    scheduledStart: Date | null;
    scheduledEnd: Date | null;
  }>;
}) {
  return (
    <div className="overflow-x-auto rounded-lg border border-border bg-paper">
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
            <tr key={job.id} className="hover:bg-surface/80">
              <td className="px-4 py-3">
                <Link
                  href={`/jobs/${job.reference}`}
                  className="font-medium text-primary hover:underline"
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
  );
}
