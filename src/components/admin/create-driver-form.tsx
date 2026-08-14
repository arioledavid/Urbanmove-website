"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { createDriverAction } from "@/lib/actions/drivers";

export function CreateDriverForm() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function onSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await createDriverAction(formData);
      if (!result.success) {
        setError(result.error);
        return;
      }
      router.push("/drivers");
      router.refresh();
    });
  }

  return (
    <form action={onSubmit} className="space-y-4">
      <div>
        <label htmlFor="driver-name" className="block text-sm font-medium text-ink">
          Name{" "}
          <span className="font-normal text-subtle">(optional)</span>
        </label>
        <input
          id="driver-name"
          name="name"
          type="text"
          autoComplete="name"
          className="mt-1.5 h-11 w-full rounded-md border border-border bg-paper px-3 text-sm text-ink outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
      </div>
      <div>
        <label
          htmlFor="driver-email"
          className="block text-sm font-medium text-ink"
        >
          Email
        </label>
        <input
          id="driver-email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className="mt-1.5 h-11 w-full rounded-md border border-border bg-paper px-3 text-sm text-ink outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
      </div>
      <p className="text-sm text-muted">
        A temporary password is generated and emailed to the driver. They must
        change it on first sign-in.
      </p>
      {error ? (
        <p className="text-sm text-primary" role="alert">
          {error}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        className="inline-flex min-h-11 w-full items-center justify-center rounded-md bg-ink px-4 text-sm font-semibold text-paper transition-transform duration-150 ease-out active:scale-[0.98] disabled:opacity-60 sm:w-auto [@media(hover:hover)_and_(pointer:fine)]:hover:bg-secondary-hover"
      >
        {pending ? "Creating…" : "Create driver"}
      </button>
    </form>
  );
}
