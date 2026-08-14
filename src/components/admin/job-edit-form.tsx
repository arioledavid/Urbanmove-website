"use client";

import { useRouter } from "next/navigation";
import { useCallback, useRef, useState, useTransition } from "react";
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

type DriverOption = {
  id: string;
  label: string;
};

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
  assignedStaffIds: string[];
  driverOptions: DriverOption[];
  /** False when this environment has no mail provider, so nothing can be delivered. */
  emailDeliveryConfigured: boolean;
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
  assignedStaffIds,
  driverOptions,
  emailDeliveryConfigured,
}: JobEditFormProps) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [formKey, setFormKey] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [overlapToast, setOverlapToast] = useState<string | null>(null);
  const [statusValue, setStatusValue] = useState<JobStatus>(status);
  const [emailValue, setEmailValue] = useState(contactEmail ?? "");
  const [selectedDriverIds, setSelectedDriverIds] = useState<string[]>(
    assignedStaffIds,
  );
  const [confirmUndelivered, setConfirmUndelivered] = useState(false);
  const [pending, startTransition] = useTransition();
  const emailInputRef = useRef<HTMLInputElement>(null);

  const dismissOverlapToast = useCallback(() => {
    setOverlapToast(null);
  }, []);

  const statusOptions = [status, ...getAllowedJobTransitions(status)].filter(
    (value, index, list) => list.indexOf(value) === index,
  );

  const trimmedEmail = emailValue.trim();
  // Codes are generated and mailed on the DRAFT to SCHEDULED transition only.
  const willIssueCodes = statusValue === "SCHEDULED" && status !== "SCHEDULED";
  const undeliverableReason = !willIssueCodes
    ? null
    : !trimmedEmail
      ? "This job has no customer email, so the pickup and dropoff codes cannot be sent to anyone."
      : !emailDeliveryConfigured
        ? `Email delivery is switched off for this environment, so nothing will reach ${trimmedEmail}.`
        : null;
  // Informational only: an admin can run the job themselves without assigning drivers.
  const noDriversAssigned =
    willIssueCodes &&
    !undeliverableReason &&
    selectedDriverIds.length === 0;

  function resetDraftState() {
    setError(null);
    setConfirmUndelivered(false);
    setStatusValue(status);
    setEmailValue(contactEmail ?? "");
    setSelectedDriverIds(assignedStaffIds);
  }

  function startEditing() {
    resetDraftState();
    setEditing(true);
  }

  function cancelEditing() {
    resetDraftState();
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

    if (undeliverableReason && !confirmUndelivered) {
      setConfirmUndelivered(true);
      return;
    }

    startTransition(async () => {
      const result = await updateJobAction(reference, formData);
      if (!result.success) {
        setError(result.error);
        return;
      }
      const warningParts: string[] = [];
      if (result.data.overlapWarnings.length > 0) {
        warningParts.push(
          `This window overlaps: ${result.data.overlapWarnings.join(", ")}.`,
        );
      }
      if (result.data.warnings.length > 0) {
        warningParts.push(...result.data.warnings);
      }
      setOverlapToast(warningParts.length > 0 ? warningParts.join(" ") : null);
      setConfirmUndelivered(false);
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
                  ref={emailInputRef}
                  value={emailValue}
                  onChange={(event) => {
                    setEmailValue(event.target.value);
                    setConfirmUndelivered(false);
                  }}
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
                value={statusValue}
                onChange={(event) => {
                  setStatusValue(event.target.value as JobStatus);
                  setConfirmUndelivered(false);
                }}
                className={fieldClassName}
              >
                {statusOptions.map((value) => (
                  <option key={value} value={value}>
                    {JOB_STATUS_LABELS[value]}
                  </option>
                ))}
              </select>
            </div>

            {willIssueCodes ? (
              undeliverableReason ? (
                <div
                  role="status"
                  className="rounded-md border border-[#F0E0A0] bg-[#FFF8E6] p-3 text-[#8A6D00]"
                >
                  <p className="text-sm font-semibold">
                    {confirmUndelivered
                      ? "Schedule anyway without sending the codes?"
                      : "The customer will not receive their codes"}
                  </p>
                  <p className="mt-1 text-sm text-pretty">
                    {undeliverableReason} You can still schedule now, then add
                    an email and use Resend codes later.
                  </p>
                  {confirmUndelivered ? (
                    <div className="mt-3 flex flex-wrap gap-2">
                      <button
                        type="submit"
                        disabled={pending}
                        className="inline-flex h-9 items-center rounded-md bg-[#8A6D00] px-3 text-sm font-medium text-paper active:scale-[0.97] disabled:opacity-60"
                      >
                        Schedule without codes
                      </button>
                      {trimmedEmail ? null : (
                        <button
                          type="button"
                          onClick={() => {
                            setConfirmUndelivered(false);
                            emailInputRef.current?.focus();
                          }}
                          className="inline-flex h-9 items-center rounded-md border border-[#8A6D00]/40 px-3 text-sm font-medium active:scale-[0.97]"
                        >
                          Add an email
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => setConfirmUndelivered(false)}
                        className="inline-flex h-9 items-center rounded-md px-3 text-sm font-medium active:scale-[0.97]"
                      >
                        Keep editing
                      </button>
                    </div>
                  ) : null}
                </div>
              ) : (
                <div
                  role="status"
                  className="rounded-md border border-border bg-surface p-3 text-sm text-muted text-pretty"
                >
                  <p>
                    Saving sends the pickup and dropoff codes to {trimmedEmail}.
                    You can resend fresh codes later from this job if needed.
                  </p>
                  {noDriversAssigned ? (
                    <p className="mt-1">
                      No drivers assigned — only admins will see this job in the
                      field. Assign drivers any time.
                    </p>
                  ) : null}
                </div>
              )
            ) : null}

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
              <input type="hidden" name="assignCrew" value="1" />
              <label
                htmlFor="assignedStaffIds"
                className="mb-1 block text-xs font-medium text-muted"
              >
                Assigned drivers
              </label>
              {driverOptions.length > 0 ? (
                <>
                  <select
                    id="assignedStaffIds"
                    name="assignedStaffIds"
                    multiple
                    value={selectedDriverIds}
                    onChange={(event) => {
                      const next = Array.from(
                        event.target.selectedOptions,
                        (option) => option.value,
                      );
                      setSelectedDriverIds(next);
                    }}
                    size={Math.min(driverOptions.length, 6)}
                    className="w-full rounded-md border border-border bg-paper px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  >
                    {driverOptions.map((driver) => (
                      <option key={driver.id} value={driver.id}>
                        {driver.label}
                      </option>
                    ))}
                  </select>
                  <p className="mt-1 text-xs text-subtle">
                    Hold ⌘ or Ctrl to select multiple drivers.
                  </p>
                </>
              ) : (
                <p className="text-sm text-muted">
                  No active drivers. Create one from the Drivers page.
                </p>
              )}
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
              label="Assigned drivers"
              value={
                driverOptions
                  .filter((driver) => assignedStaffIds.includes(driver.id))
                  .map((driver) => driver.label)
                  .join(", ") || "—"
              }
              className="sm:col-span-2"
            />
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
        title="Saved with a warning"
        description={overlapToast ? `Saved. ${overlapToast}` : ""}
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
