import Link from "next/link";
import { notFound } from "next/navigation";
import { ActivityTimeline } from "@/components/admin/activity-timeline";
import { JobEditForm } from "@/components/admin/job-edit-form";
import { PageHeader } from "@/components/admin/page-header";
import { StatusBadge, jobStatusTone } from "@/components/admin/status-badge";
import {
  JOB_STATUS_LABELS,
  SERVICE_TYPE_LABELS,
} from "@/lib/admin-format";
import { activityService } from "@/lib/services/activity-service";
import { jobService } from "@/lib/services/job-service";

type JobDetailPageProps = {
  params: Promise<{ reference: string }>;
};

export async function generateMetadata({ params }: JobDetailPageProps) {
  const { reference } = await params;
  return { title: reference };
}

export default async function JobDetailPage({ params }: JobDetailPageProps) {
  const { reference } = await params;
  const result = await jobService.getByReference(decodeURIComponent(reference));

  if (!result.success) {
    notFound();
  }

  const job = result.data;
  const activityResult = await activityService.listForEntity("Job", job.id);
  const activity = activityResult.success ? activityResult.data : [];

  return (
    <div>
      <PageHeader
        title={job.reference}
        description={job.title}
        actions={
          <Link
            href="/jobs"
            className="inline-flex h-9 items-center rounded-md border border-border px-3 text-sm font-medium text-ink hover:bg-surface"
          >
            Back to list
          </Link>
        }
      />

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <StatusBadge
          label={JOB_STATUS_LABELS[job.status]}
          tone={jobStatusTone(job.status)}
        />
        <span className="text-sm text-muted">
          {SERVICE_TYPE_LABELS[job.serviceType]}
        </span>
        <Link
          href={`/enquiries/${job.enquiry.reference}`}
          className="text-sm font-medium text-primary hover:underline"
        >
          Source enquiry {job.enquiry.reference}
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <JobEditForm
          reference={job.reference}
          title={job.title}
          status={job.status}
          scheduledStart={job.scheduledStart}
          scheduledEnd={job.scheduledEnd}
          addressFrom={job.addressFrom}
          addressTo={job.addressTo}
          notes={job.notes}
        />

        <section>
          <h2 className="mb-3 text-sm font-semibold text-ink">Activity</h2>
          <ActivityTimeline items={activity} />
        </section>
      </div>
    </div>
  );
}
