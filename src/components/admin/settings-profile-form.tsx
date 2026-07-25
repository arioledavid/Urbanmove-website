"use client";

import { useState, useTransition } from "react";
import { updateProfileAction } from "@/lib/actions/settings";

const fieldClassName =
  "h-10 w-full rounded-md border border-border bg-paper px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20";

type SettingsProfileFormProps = {
  name: string;
  email: string;
};

export function SettingsProfileForm({ name, email }: SettingsProfileFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function onSubmit(formData: FormData) {
    setError(null);
    setSuccess(null);

    startTransition(async () => {
      try {
        const result = await updateProfileAction(formData);
        if (!result.success) {
          setError(result.error);
          return;
        }
        setSuccess("Profile updated.");
      } catch (err) {
        console.error("updateProfileAction failed:", err);
        setError("Something went wrong. Please try again.");
      }
    });
  }

  return (
    <form action={onSubmit} className="space-y-4">
      <div>
        <label
          htmlFor="name"
          className="mb-1 block text-xs font-medium text-muted"
        >
          Name
        </label>
        <input
          id="name"
          name="name"
          required
          defaultValue={name}
          autoComplete="name"
          className={fieldClassName}
        />
      </div>

      <div>
        <label
          htmlFor="email"
          className="mb-1 block text-xs font-medium text-muted"
        >
          Email
        </label>
        <input
          id="email"
          type="email"
          value={email}
          readOnly
          disabled
          className={`${fieldClassName} disabled:cursor-not-allowed disabled:opacity-70`}
        />
      </div>

      {error ? (
        <p className="text-sm text-primary" role="alert">
          {error}
        </p>
      ) : null}
      {success ? (
        <p className="text-sm text-ink" role="status">
          {success}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="inline-flex h-9 items-center rounded-md bg-primary px-3 text-sm font-medium text-paper transition-colors hover:bg-primary-hover disabled:opacity-60"
      >
        {pending ? "Saving…" : "Save profile"}
      </button>
    </form>
  );
}
