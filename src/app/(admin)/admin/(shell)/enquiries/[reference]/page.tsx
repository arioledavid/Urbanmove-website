import Link from "next/link";
import { notFound } from "next/navigation";
import { ActivityTimeline } from "@/components/admin/activity-timeline";
import { EnquiryWorkflow } from "@/components/admin/enquiry-workflow";
import { PageHeader } from "@/components/admin/page-header";
import {
  formatAdminDate,
  formatAdminDateTime,
  SERVICE_TYPE_LABELS,
} from "@/lib/admin-format";
import { activityService } from "@/lib/services/activity-service";
import { enquiryService } from "@/lib/services/enquiry-service";

type EnquiryDetailPageProps = {
  params: Promise<{ reference: string }>;
};

export async function generateMetadata({ params }: EnquiryDetailPageProps) {
  const { reference } = await params;
  return { title: reference };
}

export default async function EnquiryDetailPage({
  params,
}: EnquiryDetailPageProps) {
  const { reference } = await params;
  const result = await enquiryService.getByReference(
    decodeURIComponent(reference),
  );

  if (!result.success) {
    notFound();
  }

  const enquiry = result.data;
  const activityResult = await activityService.listForEntity(
    "Enquiry",
    enquiry.id,
  );
  const activity = activityResult.success ? activityResult.data : [];

  return (
    <div>
      <PageHeader
        title={enquiry.reference}
        description={`${enquiry.contactName} · ${SERVICE_TYPE_LABELS[enquiry.serviceType]}`}
        actions={
          <Link
            href="/enquiries"
            className="inline-flex h-9 items-center rounded-md border border-border px-3 text-sm font-medium text-ink hover:bg-surface"
          >
            Back to list
          </Link>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="space-y-6">
          <EnquiryWorkflow
            reference={enquiry.reference}
            enquiryId={enquiry.id}
            status={enquiry.status}
            hasJob={Boolean(enquiry.job)}
            jobReference={enquiry.job?.reference}
          />

          <section className="rounded-lg border border-border bg-paper p-4 sm:p-5">
            <h2 className="text-sm font-semibold text-ink">Contact</h2>
            <dl className="mt-3 grid gap-3 sm:grid-cols-2">
              <div>
                <dt className="text-xs text-muted">Name</dt>
                <dd className="text-sm text-ink">{enquiry.contactName}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted">Phone</dt>
                <dd className="text-sm text-ink">{enquiry.contactPhone}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-xs text-muted">Email</dt>
                <dd className="text-sm text-ink">{enquiry.contactEmail}</dd>
              </div>
            </dl>
          </section>

          <section className="rounded-lg border border-border bg-paper p-4 sm:p-5">
            <h2 className="text-sm font-semibold text-ink">Move details</h2>
            <dl className="mt-3 grid gap-3 sm:grid-cols-2">
              <div>
                <dt className="text-xs text-muted">From</dt>
                <dd className="text-sm text-ink">
                  {enquiry.fromAddress || "—"}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-muted">To</dt>
                <dd className="text-sm text-ink">{enquiry.toAddress || "—"}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted">Postcode from</dt>
                <dd className="text-sm text-ink">
                  {enquiry.postcodeFrom || "—"}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-muted">Postcode to</dt>
                <dd className="text-sm text-ink">
                  {enquiry.postcodeTo || "—"}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-muted">Move date</dt>
                <dd className="text-sm text-ink">
                  {formatAdminDate(enquiry.moveDate)}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-muted">Property type</dt>
                <dd className="text-sm text-ink">
                  {enquiry.propertyType || "—"}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-muted">Source</dt>
                <dd className="text-sm text-ink capitalize">{enquiry.source}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted">Created</dt>
                <dd className="text-sm text-ink">
                  {formatAdminDateTime(enquiry.createdAt)}
                </dd>
              </div>
            </dl>
          </section>
        </div>

        <section>
          <h2 className="mb-3 text-sm font-semibold text-ink">Activity</h2>
          <ActivityTimeline items={activity} />
        </section>
      </div>
    </div>
  );
}
