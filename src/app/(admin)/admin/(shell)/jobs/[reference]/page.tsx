import Link from "next/link";
import { notFound } from "next/navigation";
import { ActivityTimeline } from "@/components/admin/activity-timeline";
import { JobDeleteButton } from "@/components/admin/job-delete-button";
import { JobEditForm } from "@/components/admin/job-edit-form";
import { JobResendCodesButton } from "@/components/admin/job-resend-codes-button";
import { JobTrackingPanel } from "@/components/admin/job-tracking-panel";
import { PageHeader } from "@/components/admin/page-header";
import { StatusBadge, jobStatusTone } from "@/components/admin/status-badge";
import { canAccessJob, canEditJobs } from "@/lib/admin-access";
import { requireActiveSession } from "@/lib/admin-session";
import {
  formatAdminDateTime,
  jobDisplayEnd,
  jobDisplayStart,
  JOB_STATUS_LABELS,
  SERVICE_TYPE_LABELS,
} from "@/lib/admin-format";
import { prisma } from "@/lib/db/prisma";
import { canDeleteJob } from "@/lib/job-workflow";
import { isEmailDeliveryConfigured } from "@/lib/resend";
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
  const actor = await requireActiveSession();
  if (!actor.success) {
    notFound();
  }

  const { reference } = await params;
  const result = await jobService.getByReference(decodeURIComponent(reference));

  if (!result.success) {
    notFound();
  }

  const job = result.data;
  if (!canAccessJob(actor.data.role, actor.data.id, job.assignedStaffIds)) {
    notFound();
  }

  const canEdit = canEditJobs(actor.data.role);
  const canResendCodes =
    canEdit &&
    Boolean(job.pickupCodeHash || job.dropoffCodeHash) &&
    job.status !== "COMPLETED" &&
    job.status !== "CANCELLED" &&
    !job.droppedOffAt;

  const [activityResult, drivers] = await Promise.all([
    canEdit ? activityService.listForEntity("Job", job.id) : Promise.resolve(null),
    canEdit
      ? prisma.user.findMany({
          where: { active: true, role: "DRIVER" },
          select: { id: true, name: true, email: true },
          orderBy: [{ name: "asc" }, { email: "asc" }],
        })
      : Promise.resolve([]),
  ]);
  const activity = activityResult?.success ? activityResult.data : [];
  const driverOptions = drivers.map((driver) => ({
    id: driver.id,
    label: driver.name?.trim() || driver.email,
  }));
  const emailDeliveryConfigured = isEmailDeliveryConfigured();

  return (
    <div>
      <PageHeader
        title={job.reference}
        description={job.title}
        actions={
          <>
            <Link
              href="/jobs"
              className="inline-flex h-9 items-center rounded-md border border-border px-3 text-sm font-medium text-ink hover:bg-surface"
            >
              Back to list
            </Link>
            {canResendCodes ? (
              <JobResendCodesButton
                reference={job.reference}
                contactEmail={job.contactEmail}
                emailDeliveryConfigured={emailDeliveryConfigured}
              />
            ) : null}
            {canEdit && canDeleteJob(job.status) ? (
              <JobDeleteButton reference={job.reference} />
            ) : null}
          </>
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
        <span className="text-sm text-muted">{job.contactName}</span>
      </div>

      <div className="mb-6">
        <JobTrackingPanel
          jobId={job.id}
          pickupVerifiedAt={job.pickupVerifiedAt?.toISOString() ?? null}
          pickedUpAt={job.pickedUpAt?.toISOString() ?? null}
          droppedOffAt={job.droppedOffAt?.toISOString() ?? null}
          actualDurationMinutes={job.actualDurationMinutes}
          pickupNotes={job.pickupNotes}
          dropoffNotes={job.dropoffNotes}
          pickupPhotos={(job.pickupPhotos ?? []).map((photo) => ({
            url: photo.url,
            publicId: photo.publicId,
            createdAt: photo.createdAt.toISOString(),
          }))}
          dropoffPhotos={(job.dropoffPhotos ?? []).map((photo) => ({
            url: photo.url,
            publicId: photo.publicId,
            createdAt: photo.createdAt.toISOString(),
          }))}
          hasPickupCode={Boolean(job.pickupCodeHash)}
          hasDropoffCode={Boolean(job.dropoffCodeHash)}
          dropoffVerifiedAt={job.dropoffVerifiedAt?.toISOString() ?? null}
        />
      </div>

      {canEdit ? (
        <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          <JobEditForm
            reference={job.reference}
            title={job.title}
            status={job.status}
            contactName={job.contactName}
            contactEmail={job.contactEmail}
            contactPhone={job.contactPhone}
            scheduledStart={job.scheduledStart}
            scheduledEnd={job.scheduledEnd}
            addressFrom={job.addressFrom}
            addressTo={job.addressTo}
            notes={job.notes}
            assignedStaffIds={job.assignedStaffIds}
            driverOptions={driverOptions}
            emailDeliveryConfigured={emailDeliveryConfigured}
          />

          <section>
            <h2 className="mb-3 text-sm font-semibold text-ink">Activity</h2>
            <ActivityTimeline items={activity} />
          </section>
        </div>
      ) : (
        <section className="rounded-lg border border-border bg-paper p-4 sm:p-5">
          <h2 className="mb-4 text-sm font-semibold text-ink">Job details</h2>
          <dl className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <dt className="mb-1 text-xs font-medium text-muted">Title</dt>
              <dd className="text-sm text-ink">{job.title}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="mb-1 text-xs font-medium text-muted">Contact</dt>
              <dd className="text-sm text-ink">{job.contactName}</dd>
            </div>
            <div>
              <dt className="mb-1 text-xs font-medium text-muted">From</dt>
              <dd className="text-sm text-ink">{job.addressFrom || "—"}</dd>
            </div>
            <div>
              <dt className="mb-1 text-xs font-medium text-muted">To</dt>
              <dd className="text-sm text-ink">{job.addressTo || "—"}</dd>
            </div>
            <div>
              <dt className="mb-1 text-xs font-medium text-muted">Start</dt>
              <dd className="text-sm text-ink">
                {formatAdminDateTime(jobDisplayStart(job))}
              </dd>
            </div>
            <div>
              <dt className="mb-1 text-xs font-medium text-muted">End</dt>
              <dd className="text-sm text-ink">
                {formatAdminDateTime(jobDisplayEnd(job))}
              </dd>
            </div>
          </dl>
        </section>
      )}
    </div>
  );
}
