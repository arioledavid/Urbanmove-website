"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import type { ServiceType } from "@prisma/client";
import { createJobAction } from "@/lib/actions/jobs";
import { SERVICE_TYPE_LABELS } from "@/lib/admin-format";

const fieldClassName =
  "h-10 w-full rounded-md border border-border bg-paper px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20";

const SERVICE_TYPES = Object.keys(SERVICE_TYPE_LABELS) as ServiceType[];

export function JobCreateForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function onSubmit(formData: FormData) {
    setError(null);

    startTransition(async () => {
      try {
        const result = await createJobAction(formData);
        if (!result.success) {
          setError(result.error);
          return;
        }
        router.push(`/jobs/${result.data.reference}`);
        router.refresh();
      } catch (err) {
        console.error("createJobAction failed:", err);
        setError("Something went wrong. Please try again.");
      }
    });
  }

  return (
    <form action={onSubmit} className="space-y-6">
      <section className="rounded-lg border border-border bg-paper p-4 sm:p-5">
        <h2 className="mb-4 text-sm font-semibold text-ink">Contact</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label
              htmlFor="contactName"
              className="mb-1 block text-xs font-medium text-muted"
            >
              Name
            </label>
            <input
              id="contactName"
              name="contactName"
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
              autoComplete="tel"
              className={fieldClassName}
            />
          </div>
        </div>
      </section>

      <section className="rounded-lg border border-border bg-paper p-4 sm:p-5">
        <h2 className="mb-4 text-sm font-semibold text-ink">Job details</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label
              htmlFor="serviceType"
              className="mb-1 block text-xs font-medium text-muted"
            >
              Service
            </label>
            <select
              id="serviceType"
              name="serviceType"
              required
              defaultValue="REMOVAL"
              className={fieldClassName}
            >
              {SERVICE_TYPES.map((value) => (
                <option key={value} value={value}>
                  {SERVICE_TYPE_LABELS[value]}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label
              htmlFor="scheduledStart"
              className="mb-1 block text-xs font-medium text-muted"
            >
              Date
            </label>
            <input
              id="scheduledStart"
              name="scheduledStart"
              type="datetime-local"
              required
              className={fieldClassName}
            />
          </div>
          <div className="sm:col-span-2">
            <label
              htmlFor="title"
              className="mb-1 block text-xs font-medium text-muted"
            >
              Title{" "}
              <span className="font-normal text-subtle">(optional)</span>
            </label>
            <input
              id="title"
              name="title"
              placeholder="Defaults to service — contact name"
              className={fieldClassName}
            />
          </div>
          <div className="sm:col-span-2">
            <label
              htmlFor="addressFrom"
              className="mb-1 block text-xs font-medium text-muted"
            >
              From address{" "}
              <span className="font-normal text-subtle">(optional)</span>
            </label>
            <input
              id="addressFrom"
              name="addressFrom"
              className={fieldClassName}
            />
          </div>
          <div className="sm:col-span-2">
            <label
              htmlFor="addressTo"
              className="mb-1 block text-xs font-medium text-muted"
            >
              To address{" "}
              <span className="font-normal text-subtle">(optional)</span>
            </label>
            <input id="addressTo" name="addressTo" className={fieldClassName} />
          </div>
          <div className="sm:col-span-2">
            <label
              htmlFor="notes"
              className="mb-1 block text-xs font-medium text-muted"
            >
              Notes{" "}
              <span className="font-normal text-subtle">(optional)</span>
            </label>
            <textarea
              id="notes"
              name="notes"
              rows={3}
              className="w-full rounded-md border border-border bg-paper px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>
      </section>

      {error ? (
        <p className="text-sm text-primary" role="alert">
          {error}
        </p>
      ) : null}

      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={pending}
          className="inline-flex h-10 items-center justify-center rounded-md bg-ink px-4 text-sm font-medium text-paper transition-transform duration-150 ease-out active:scale-[0.97] disabled:opacity-60 [@media(hover:hover)_and_(pointer:fine)]:hover:bg-secondary-hover"
        >
          {pending ? "Creating…" : "Create job"}
        </button>
        <button
          type="button"
          disabled={pending}
          onClick={() => router.push("/jobs")}
          className="inline-flex h-10 items-center justify-center rounded-md border border-border px-4 text-sm font-medium text-ink transition-transform duration-150 ease-out active:scale-[0.97] disabled:opacity-60 [@media(hover:hover)_and_(pointer:fine)]:hover:bg-surface"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
