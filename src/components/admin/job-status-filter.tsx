"use client";

import { useRouter } from "next/navigation";
import type { JobStatus } from "@prisma/client";
import { JOB_STATUS_LABELS } from "@/lib/admin-format";

const FILTER_STATUSES: Array<JobStatus | "ALL"> = [
  "ALL",
  "DRAFT",
  "SCHEDULED",
  "IN_PROGRESS",
  "COMPLETED",
  "CANCELLED",
];

type JobStatusFilterProps = {
  value: JobStatus | "ALL";
};

export function JobStatusFilter({ value }: JobStatusFilterProps) {
  const router = useRouter();

  return (
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
        defaultValue={value}
        onChange={(event) => {
          const next = event.target.value;
          router.push(next === "ALL" ? "/jobs" : `/jobs?status=${next}`);
        }}
        className="h-11 w-full rounded-md border border-border bg-paper px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 sm:h-10"
      >
        {FILTER_STATUSES.map((status) => (
          <option key={status} value={status}>
            {status === "ALL" ? "All statuses" : JOB_STATUS_LABELS[status]}
          </option>
        ))}
      </select>
    </div>
  );
}
