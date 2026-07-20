import Link from "next/link";
import type { EnquiryStatus } from "@prisma/client";
import { PageHeader } from "@/components/admin/page-header";
import {
  StatusBadge,
  enquiryStatusTone,
} from "@/components/admin/status-badge";
import {
  ENQUIRY_LIST_STATUSES,
  ENQUIRY_STATUS_LABELS,
} from "@/lib/enquiry-workflow";
import { formatAdminDate, SERVICE_TYPE_LABELS } from "@/lib/admin-format";
import { enquiryService } from "@/lib/services/enquiry-service";

export const metadata = { title: "Enquiries" };

const FILTER_STATUSES: Array<EnquiryStatus | "ALL"> = [
  "ALL",
  ...ENQUIRY_LIST_STATUSES,
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
        description="Website quotes and intake pipeline. Converted enquiries move to Jobs and leave this list; records stay for reporting."
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
            className="h-11 w-full rounded-md border border-border bg-paper px-3 text-sm text-ink outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 sm:h-10"
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
            className="h-11 w-full rounded-md border border-border bg-paper px-3 text-sm text-ink outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 sm:h-10"
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
          className="inline-flex h-11 items-center justify-center rounded-md bg-ink px-4 text-sm font-medium text-paper transition-transform duration-150 ease-out active:scale-[0.97] sm:h-10 [@media(hover:hover)_and_(pointer:fine)]:hover:bg-secondary-hover"
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
        <>
          <ul className="space-y-3 md:hidden">
            {enquiries.map((enquiry) => (
              <li key={enquiry.id}>
                <Link
                  href={`/enquiries/${enquiry.reference}`}
                  className="block rounded-lg border border-border bg-paper p-4 transition-[transform,border-color] duration-150 ease-out active:scale-[0.99] [@media(hover:hover)_and_(pointer:fine)]:hover:border-primary/40"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-medium text-primary">
                        {enquiry.reference}
                      </p>
                      <p className="mt-0.5 truncate text-sm text-ink">
                        {enquiry.contactName}
                      </p>
                    </div>
                    <StatusBadge
                      label={ENQUIRY_STATUS_LABELS[enquiry.status]}
                      tone={enquiryStatusTone(enquiry.status)}
                    />
                  </div>
                  <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2 text-xs">
                    <div>
                      <dt className="text-muted">Service</dt>
                      <dd className="text-ink">
                        {SERVICE_TYPE_LABELS[enquiry.serviceType]}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-muted">Move date</dt>
                      <dd className="text-ink">
                        {formatAdminDate(enquiry.moveDate)}
                      </dd>
                    </div>
                    <div className="col-span-2">
                      <dt className="text-muted">Created</dt>
                      <dd className="text-ink">
                        {formatAdminDate(enquiry.createdAt)}
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
                  <th className="px-4 py-3 font-medium">Contact</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Service</th>
                  <th className="px-4 py-3 font-medium">Move date</th>
                  <th className="px-4 py-3 font-medium">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {enquiries.map((enquiry) => (
                  <tr
                    key={enquiry.id}
                    className="[@media(hover:hover)_and_(pointer:fine)]:hover:bg-surface/80"
                  >
                    <td className="px-4 py-3">
                      <Link
                        href={`/enquiries/${enquiry.reference}`}
                        className="font-medium text-primary [@media(hover:hover)_and_(pointer:fine)]:hover:underline"
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
        </>
      )}
    </div>
  );
}
