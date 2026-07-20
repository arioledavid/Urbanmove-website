"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import type { JobStatus } from "@prisma/client";
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
  const [warnings, setWarnings] = useState<string[]>([]);
  const [pending, startTransition] = useTransition();

  const statusOptions = [status, ...getAllowedJobTransitions(status)].filter(
    (value, index, list) => list.indexOf(value) === index,
  );

  function startEditing() {
    setError(null);
    setWarnings([]);
    setEditing(true);
  }

  function cancelEditing() {
    setError(null);
    setWarnings([]);
    setEditing(false);
    setFormKey((key) => key + 1);
  }

  function onSubmit(formData: FormData) {
    setError(null);
    setWarnings([]);

    const status = String(formData.get("status") ?? "");
    const startValue = String(formData.get("scheduledStart") ?? "");
    const scheduledStartDate = parseOpsDateTimeLocal(startValue);

    if (
      (status === "SCHEDULED" || status === "IN_PROGRESS") &&
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
      setWarnings(result.data.overlapWarnings);
      setEditing(false);
      router.refresh();
    });
  }

  return (
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

      {warnings.length > 0 ? (
        <div
          className="rounded-md border border-[#F0E0A0] bg-[#FFF8E6] px-3 py-2 text-sm text-[#8A6D00]"
          role="status"
        >
          <p className="font-medium">Possible schedule overlap</p>
          <p className="mt-1">
            This window overlaps: {warnings.join(", ")}. Save still succeeded —
            confirm crews can cover both jobs.
          </p>
        </div>
      ) : null}
    </div>
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
