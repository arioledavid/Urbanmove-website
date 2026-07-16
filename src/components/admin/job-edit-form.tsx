"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import type { JobStatus } from "@prisma/client";
import { updateJobAction } from "@/lib/actions/jobs";
import { JOB_STATUS_LABELS, toDateTimeLocalValue } from "@/lib/admin-format";

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

const STATUSES: JobStatus[] = [
  "DRAFT",
  "SCHEDULED",
  "IN_PROGRESS",
  "COMPLETED",
  "CANCELLED",
];

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
  const [error, setError] = useState<string | null>(null);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [pending, startTransition] = useTransition();

  function onSubmit(formData: FormData) {
    setError(null);
    setWarnings([]);
    startTransition(async () => {
      const result = await updateJobAction(reference, formData);
      if (!result.success) {
        setError(result.error);
        return;
      }
      setWarnings(result.data.overlapWarnings);
      router.refresh();
    });
  }

  return (
    <form action={onSubmit} className="space-y-4 rounded-lg border border-border bg-paper p-4 sm:p-5">
      <h2 className="text-sm font-semibold text-ink">Schedule & details</h2>

      <div>
        <label htmlFor="title" className="mb-1 block text-xs font-medium text-muted">
          Title
        </label>
        <input
          id="title"
          name="title"
          defaultValue={title}
          required
          className="h-10 w-full rounded-md border border-border bg-paper px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
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
            className="h-10 w-full rounded-md border border-border bg-paper px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
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
            className="h-10 w-full rounded-md border border-border bg-paper px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </div>
      </div>

      <div>
        <label htmlFor="status" className="mb-1 block text-xs font-medium text-muted">
          Status
        </label>
        <select
          id="status"
          name="status"
          defaultValue={status}
          className="h-10 w-full rounded-md border border-border bg-paper px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
        >
          {STATUSES.map((value) => (
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
            className="h-10 w-full rounded-md border border-border bg-paper px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
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
            className="h-10 w-full rounded-md border border-border bg-paper px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </div>
      </div>

      <div>
        <label htmlFor="notes" className="mb-1 block text-xs font-medium text-muted">
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

      {error ? (
        <p className="text-sm text-primary" role="alert">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="inline-flex h-10 items-center rounded-md bg-primary px-4 text-sm font-medium text-paper hover:bg-primary-hover disabled:opacity-60"
      >
        {pending ? "Saving…" : "Save job"}
      </button>
    </form>
  );
}
