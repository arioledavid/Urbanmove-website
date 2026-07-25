"use client";

import { useRouter } from "next/navigation";
import { useCallback, useState, useTransition } from "react";
import type { JobStatus } from "@prisma/client";
import { AdminToast } from "@/components/admin/admin-toast";
import { updateJobAction } from "@/lib/actions/jobs";
import {
  formatAdminDateTime,
  JOB_STATUS_LABELS,
  toDateTimeLocalValue,
} from "@/lib/admin-format";
import { getAllowedJobTransitions } from "@/lib/job-workflow";
import {
  isPastOpsDateTime,
  parseOpsDateTimeLocal,
} from "@/lib/ops-time";

type JobEditFormProps = {
  reference: string;
  title: string;
  status: JobStatus;
  contactName: string;
  contactEmail: string | null;
  contactPhone: string | null;
  scheduledStart: Date | null;
  scheduledEnd: Date | null;
  addressFrom: string | null;
  addressTo: string | null;
  notes: string | null;
};

const fieldClassName =
  "h-10 w-full rounded-md border border-border bg-paper px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20";

export function JobEditForm({
  reference,
  title,
  status,
  contactName,
  contactEmail,
  contactPhone,
  scheduledStart,
  scheduledEnd,
  addressFrom,
  addressTo,
  notes,
}: JobEditFormProps) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [formKey, setFormKey] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [overlapToast, setOverlapToast] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const dismissOverlapToast = useCallback(() => {
    setOverlapToast(null);
  }, []);

  const statusOptions = [status, ...getAllowedJobTransitions(status)].filter(
    (value, index, list) => list.indexOf(value) === index,
  );

  function startEditing() {
    setError(null);
    setEditing(true);
  }

  function cancelEditing() {
    setError(null);
    setEditing(false);
    setFormKey((key) => key + 1);
  }

  function onSubmit(formData: FormData) {
    setError(null);

    const nextStatus = String(formData.get("status") ?? "");
    const startValue = String(formData.get("scheduledStart") ?? "");
    const scheduledStartDate = parseOpsDateTimeLocal(startValue);

    if (
      (nextStatus === "SCHEDULED" || nextStatus === "IN_PROGRESS") &&
      scheduledStartDate &&
      isPastOpsDateTime(scheduledStartDate)
    ) {
      setError("Scheduled start cannot be in the past.");
      return;
    }

    startTransition(async () => {
      const result = await updateJobAction(reference, formData);
      if (!result.success) {
        setError(result.error);
        return;
      }
      if (result.data.overlapWarnings.length > 0) {
        setOverlapToast(result.data.overlapWarnings.join(", "));
      } else {
        setOverlapToast(null);
      }
      setEditing(false);
      router.refresh();
    });
  }

  return (
    <>
      <div className="space-y-4 rounded-lg border border-border bg-paper p-4 sm:p-5">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-sm font-semibold text-ink">Schedule & details</h2>
          {!editing ? (
            <button
              type="button"
              onClick={startEditing}
              className="inline-flex h-9 items-center rounded-md border border-border px-3 text-sm font-medium text-ink hover:bg-surface active:scale-[0.97]"
            >
              Edit
            </button>
          ) : null}
        </div>

        {editing ? (
          <form key={formKey} action={onSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="title"
                className="mb-1 block text-xs font-medium text-muted"
              >
                Title
              </label>
              <input
                id="title"
                name="title"
                defaultValue={title}
                required
                className={fieldClassName}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label
                  htmlFor="contactName"
                  className="mb-1 block text-xs font-medium text-muted"
                >
                  Contact name
                </label>
                <input
                  id="contactName"
                  name="contactName"
                  defaultValue={contactName}
                  required
                  autoComplete="name"
                  className={fieldClassName}
                />
              </div>
              <div>
                <label
                  htmlFor="contactEmail"
                  className="mb-1 block text-xs font-medium text-muted"
                >
                  Email{" "}
                  <span className="font-normal text-subtle">(optional)</span>
                </label>
                <input
                  id="contactEmail"
                  name="contactEmail"
                  type="email"
                  defaultValue={contactEmail ?? ""}
                  autoComplete="email"
                  className={fieldClassName}
                />
              </div>
              <div>
                <label
                  htmlFor="contactPhone"
                  className="mb-1 block text-xs font-medium text-muted"
                >
                  Phone{" "}
                  <span className="font-normal text-subtle">(optional)</span>
                </label>
                <input
                  id="contactPhone"
                  name="contactPhone"
                  type="tel"
                  defaultValue={contactPhone ?? ""}
                  autoComplete="tel"
                  className={fieldClassName}
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="scheduledStart"
                  className="mb-1 block text-xs font-medium text-muted"
                >
                  Scheduled start
                </label>
                <input
                  id="scheduledStart"
                  name="scheduledStart"
                  type="datetime-local"
                  defaultValue={toDateTimeLocalValue(scheduledStart)}
                  className={fieldClassName}
                />
              </div>
              <div>
                <label
                  htmlFor="scheduledEnd"
                  className="mb-1 block text-xs font-medium text-muted"
                >
                  Scheduled end
                </label>
                <input
                  id="scheduledEnd"
                  name="scheduledEnd"
                  type="datetime-local"
                  defaultValue={toDateTimeLocalValue(scheduledEnd)}
                  className={fieldClassName}
                />
              </div>
            </div>

            <div>
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
                className={fieldClassName}
              >
                {statusOptions.map((value) => (
                  <option key={value} value={value}>
                    {JOB_STATUS_LABELS[value]}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="addressFrom"
                  className="mb-1 block text-xs font-medium text-muted"
                >
                  Address from
                </label>
                <input
                  id="addressFrom"
                  name="addressFrom"
                  defaultValue={addressFrom ?? ""}
                  className={fieldClassName}
                />
              </div>
              <div>
                <label
                  htmlFor="addressTo"
                  className="mb-1 block text-xs font-medium text-muted"
                >
                  Address to
                </label>
                <input
                  id="addressTo"
                  name="addressTo"
                  defaultValue={addressTo ?? ""}
                  className={fieldClassName}
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="notes"
                className="mb-1 block text-xs font-medium text-muted"
              >
                Notes
              </label>
              <textarea
                id="notes"
                name="notes"
                rows={4}
                defaultValue={notes ?? ""}
                className="w-full rounded-md border border-border bg-paper px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>

            {error ? (
              <p className="text-sm text-primary" role="alert">
                {error}
              </p>
            ) : null}

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="submit"
                disabled={pending}
                className="inline-flex h-10 items-center rounded-md bg-primary px-4 text-sm font-medium text-paper hover:bg-primary-hover active:scale-[0.97] disabled:opacity-60"
              >
                {pending ? "Saving…" : "Save job"}
              </button>
              <button
                type="button"
                onClick={cancelEditing}
                disabled={pending}
                className="inline-flex h-10 items-center rounded-md border border-border px-4 text-sm font-medium text-ink hover:bg-surface active:scale-[0.97] disabled:opacity-60"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <dl className="grid gap-4 sm:grid-cols-2">
            <ViewField label="Title" value={title} className="sm:col-span-2" />
            <ViewField
              label="Contact name"
              value={contactName}
              className="sm:col-span-2"
            />
            <ViewField label="Email" value={contactEmail || "—"} />
            <ViewField label="Phone" value={contactPhone || "—"} />
            <ViewField
              label="Scheduled start"
              value={formatAdminDateTime(scheduledStart)}
            />
            <ViewField
              label="Scheduled end"
              value={formatAdminDateTime(scheduledEnd)}
            />
            <ViewField
              label="Status"
              value={JOB_STATUS_LABELS[status]}
              className="sm:col-span-2"
            />
            <ViewField label="Address from" value={addressFrom || "—"} />
            <ViewField label="Address to" value={addressTo || "—"} />
            <ViewField
              label="Notes"
              value={notes || "—"}
              className="sm:col-span-2"
              multiline
            />
          </dl>
        )}
      </div>

      <AdminToast
        open={Boolean(overlapToast)}
        title="Schedule overlap"
        description={
          overlapToast
            ? `Saved. This window overlaps: ${overlapToast}.`
            : ""
        }
        tone="warning"
        onClose={dismissOverlapToast}
      />
    </>
  );
}

function ViewField({
  label,
  value,
  className,
  multiline,
}: {
  label: string;
  value: string;
  className?: string;
  multiline?: boolean;
}) {
  return (
    <div className={className}>
      <dt className="mb-1 text-xs font-medium text-muted">{label}</dt>
      <dd
        className={
          multiline
            ? "whitespace-pre-wrap text-sm text-ink"
            : "text-sm text-ink"
        }
      >
        {value}
      </dd>
    </div>
  );
}
