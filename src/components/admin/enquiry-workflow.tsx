"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import type { EnquiryStatus } from "@prisma/client";
import {
  convertEnquiryToJobAction,
  updateEnquiryStatusAction,
} from "@/lib/actions/enquiries";
import {
  ENQUIRY_MAIN_PATH,
  ENQUIRY_STATUS_LABELS,
  getAllowedEnquiryTransitions,
} from "@/lib/enquiry-workflow";
import { StatusBadge, enquiryStatusTone } from "@/components/admin/status-badge";
import { cn } from "@/lib/utils";

type EnquiryWorkflowProps = {
  reference: string;
  enquiryId: string;
  status: EnquiryStatus;
  hasJob: boolean;
  jobReference?: string | null;
};

export function EnquiryWorkflow({
  reference,
  enquiryId,
  status,
  hasJob,
  jobReference,
}: EnquiryWorkflowProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const allowed = getAllowedEnquiryTransitions(status);
  const forwardSteps = allowed.filter((s) => s !== "LOST" && s !== "SPAM");

  function advance(next: EnquiryStatus) {
    setError(null);
    startTransition(async () => {
      try {
        const result = await updateEnquiryStatusAction(reference, next);
        if (!result.success) {
          setError(result.error);
          return;
        }
        router.refresh();
      } catch (err) {
        console.error("updateEnquiryStatusAction failed:", err);
        setError("Something went wrong updating the status. Please try again.");
      }
    });
  }

  function convertToJob() {
    setError(null);
    startTransition(async () => {
      try {
        const result = await convertEnquiryToJobAction(enquiryId, reference);
        if (!result.success) {
          setError(result.error);
          return;
        }
        router.push(`/jobs/${result.data.jobReference}`);
        router.refresh();
      } catch (err) {
        console.error("convertEnquiryToJobAction failed:", err);
        setError("Something went wrong creating the job. Please try again.");
      }
    });
  }

  return (
    <div className="rounded-lg border border-border bg-paper p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-medium tracking-wide text-muted uppercase">
            Workflow
          </p>
          <div className="mt-2">
            <StatusBadge
              label={ENQUIRY_STATUS_LABELS[status]}
              tone={enquiryStatusTone(status)}
            />
          </div>
        </div>
        {hasJob && jobReference ? (
          <a
            href={`/jobs/${jobReference}`}
            className="text-sm font-medium text-primary hover:underline"
          >
            View job {jobReference}
          </a>
        ) : null}
      </div>

      <ol className="mt-5 flex flex-wrap gap-2">
        {ENQUIRY_MAIN_PATH.map((step, index) => {
          const currentIdx = ENQUIRY_MAIN_PATH.indexOf(status);
          const reached =
            status === "LOST" || status === "SPAM"
              ? false
              : currentIdx >= index;
          const isCurrent = step === status;
          return (
            <li
              key={step}
              className={cn(
                "rounded-md border px-2.5 py-1 text-xs",
                isCurrent
                  ? "border-primary bg-[#FFF1F0] font-medium text-primary"
                  : reached
                    ? "border-border bg-surface text-ink"
                    : "border-border text-subtle",
              )}
            >
              {ENQUIRY_STATUS_LABELS[step]}
            </li>
          );
        })}
      </ol>

      <div className="mt-5 flex flex-wrap gap-2">
        {forwardSteps.map((next) => (
          <button
            key={next}
            type="button"
            disabled={pending}
            onClick={() => advance(next)}
            className="inline-flex h-9 items-center rounded-md bg-primary px-3 text-sm font-medium text-paper transition-colors hover:bg-primary-hover disabled:opacity-60"
          >
            {pending ? "Saving…" : `Mark as ${ENQUIRY_STATUS_LABELS[next]}`}
          </button>
        ))}

        {status === "DEPOSIT_PAID" && !hasJob ? (
          <button
            type="button"
            disabled={pending}
            onClick={convertToJob}
            className="inline-flex h-9 items-center rounded-md bg-ink px-3 text-sm font-medium text-paper transition-colors hover:bg-secondary-hover disabled:opacity-60"
          >
            {pending ? "Creating…" : "Convert to Job"}
          </button>
        ) : null}

        {allowed.includes("LOST") ? (
          <button
            type="button"
            disabled={pending}
            onClick={() => advance("LOST")}
            className="inline-flex h-9 items-center rounded-md border border-border px-3 text-sm font-medium text-muted hover:bg-surface disabled:opacity-60"
          >
            Mark Lost
          </button>
        ) : null}

        {allowed.includes("SPAM") ? (
          <button
            type="button"
            disabled={pending}
            onClick={() => advance("SPAM")}
            className="inline-flex h-9 items-center rounded-md border border-border px-3 text-sm font-medium text-muted hover:bg-surface disabled:opacity-60"
          >
            Mark Spam
          </button>
        ) : null}

        {allowed.includes("CONTACTED") &&
        (status === "LOST" || status === "SPAM") ? (
          <button
            type="button"
            disabled={pending}
            onClick={() => advance("CONTACTED")}
            className="inline-flex h-9 items-center rounded-md border border-border px-3 text-sm font-medium text-ink hover:bg-surface disabled:opacity-60"
          >
            Reopen as Contacted
          </button>
        ) : null}
      </div>

      {error ? (
        <p className="mt-3 text-sm text-primary" role="alert">
          {error}
        </p>
      ) : null}

      <p className="mt-4 text-xs text-subtle">
        Quote Sent is a manual marker only — quotes are still prepared outside
        this system. Job Created and later steps advance via Convert to Job /
        job scheduling.
      </p>
    </div>
  );
}
