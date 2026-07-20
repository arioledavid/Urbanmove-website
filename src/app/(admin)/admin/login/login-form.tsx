"use client";

import { useState, type FormEvent } from "react";
import { signIn } from "next-auth/react";

type LoginFormProps = {
  callbackUrl?: string;
  error?: string;
};

function safeCallbackUrl(callbackUrl?: string): string {
  if (
    callbackUrl &&
    callbackUrl.startsWith("/") &&
    !callbackUrl.startsWith("//")
  ) {
    return callbackUrl === "/" ? "/dashboard" : callbackUrl;
  }
  return "/dashboard";
}

export function LoginForm({ callbackUrl, error }: LoginFormProps) {
  const [pending, setPending] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const redirectTo = safeCallbackUrl(callbackUrl);

  const displayError =
    formError ??
    (error === "CredentialsSignin"
      ? "Invalid email or password."
      : error
        ? "Unable to sign in."
        : null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setFormError(null);

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");

    if (!email || !password) {
      setFormError("Email and password are required.");
      setPending(false);
      return;
    }

    if (password.length < 12) {
      setFormError("Invalid email or password.");
      setPending(false);
      return;
    }

    // Client signIn hits /api/auth/callback/credentials so the session cookie
    // is set reliably (server-action signIn can drop it on Next.js 16).
    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
      callbackUrl: redirectTo,
    });

    if (result?.error) {
      setFormError("Invalid email or password.");
      setPending(false);
      return;
    }

    window.location.assign(result?.url ?? redirectTo);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-ink">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="username"
          required
          className="h-11 w-full rounded-md border border-border bg-paper px-3 text-sm text-ink outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
      </div>

      <div>
        <label
          htmlFor="password"
          className="mb-1.5 block text-sm font-medium text-ink"
        >
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          minLength={12}
          className="h-11 w-full rounded-md border border-border bg-paper px-3 text-sm text-ink outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
      </div>

      {displayError ? (
        <p className="text-sm text-primary" role="alert">
          {displayError}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="inline-flex h-11 w-full items-center justify-center rounded-md bg-primary text-sm font-medium text-paper transition-colors hover:bg-primary-hover disabled:opacity-60"
      >
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
