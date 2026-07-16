import Link from "next/link";
import type { EnquiryStatus } from "@prisma/client";
import { PageHeader } from "@/components/admin/page-header";
import {
  StatusBadge,
  enquiryStatusTone,
} from "@/components/admin/status-badge";
import {
  ENQUIRY_MAIN_PATH,
  ENQUIRY_STATUS_LABELS,
} from "@/lib/enquiry-workflow";
import { formatAdminDate, SERVICE_TYPE_LABELS } from "@/lib/admin-format";
import { enquiryService } from "@/lib/services/enquiry-service";

export const metadata = { title: "Enquiries" };

const FILTER_STATUSES: Array<EnquiryStatus | "ALL"> = [
  "ALL",
  ...ENQUIRY_MAIN_PATH,
  "LOST",
  "SPAM",
];

type EnquiriesPageProps = {
  searchParams: Promise<{ status?: string; q?: string }>;
};

export default async function EnquiriesPage({
  searchParams,
}: EnquiriesPageProps) {
  const params = await searchParams;
  const statusParam = (params.status ?? "ALL") as EnquiryStatus | "ALL";
  const status = FILTER_STATUSES.includes(statusParam) ? statusParam : "ALL";
  const q = params.q?.trim() ?? "";

  const result = await enquiryService.list({ status, q });
  const enquiries = result.success ? result.data : [];

  return (
    <div>
      <PageHeader
        title="Enquiries"
        description="Website quotes and intake pipeline. Advance status through the workflow — do not skip ahead."
      />

      <form className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex-1">
          <label htmlFor="q" className="mb-1 block text-xs font-medium text-muted">
            Search
          </label>
          <input
            id="q"
            name="q"
            defaultValue={q}
            placeholder="Reference, name, postcode, address…"
            className="h-10 w-full rounded-md border border-border bg-paper px-3 text-sm text-ink outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </div>
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
            className="h-10 w-full rounded-md border border-border bg-paper px-3 text-sm text-ink outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          >
            {FILTER_STATUSES.map((value) => (
              <option key={value} value={value}>
                {value === "ALL" ? "All statuses" : ENQUIRY_STATUS_LABELS[value]}
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
      ) : enquiries.length === 0 ? (
        <div className="rounded-lg border border-border bg-paper px-4 py-10 text-sm text-muted">
          No enquiries match these filters.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border bg-paper">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-border bg-surface text-xs tracking-wide text-muted uppercase">
              <tr>
                <th className="px-4 py-3 font-medium">Reference</th>
                <th className="px-4 py-3 font-medium">Contact</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Service</th>
                <th className="px-4 py-3 font-medium">Move date</th>
                <th className="px-4 py-3 font-medium">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {enquiries.map((enquiry) => (
                <tr key={enquiry.id} className="hover:bg-surface/80">
                  <td className="px-4 py-3">
                    <Link
                      href={`/enquiries/${enquiry.reference}`}
                      className="font-medium text-primary hover:underline"
                    >
                      {enquiry.reference}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-ink">{enquiry.contactName}</td>
                  <td className="px-4 py-3">
                    <StatusBadge
                      label={ENQUIRY_STATUS_LABELS[enquiry.status]}
                      tone={enquiryStatusTone(enquiry.status)}
                    />
                  </td>
                  <td className="px-4 py-3 text-muted">
                    {SERVICE_TYPE_LABELS[enquiry.serviceType]}
                  </td>
                  <td className="px-4 py-3 text-muted">
                    {formatAdminDate(enquiry.moveDate)}
                  </td>
                  <td className="px-4 py-3 text-muted">
                    {formatAdminDate(enquiry.createdAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
