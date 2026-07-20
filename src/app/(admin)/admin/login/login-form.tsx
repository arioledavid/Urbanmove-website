"use client";

import { useActionState, useEffect } from "react";
import { loginAction, type LoginState } from "@/app/(admin)/admin/login/actions";

type LoginFormProps = {
  callbackUrl?: string;
  error?: string;
};

const initialState: LoginState = {};

export function LoginForm({ callbackUrl, error }: LoginFormProps) {
  const [state, formAction, pending] = useActionState(loginAction, initialState);

  useEffect(() => {
    if (!state.redirectTo) return;
    window.location.assign(state.redirectTo);
  }, [state.redirectTo]);

  const displayError =
    state.error ??
    (error === "CredentialsSignin"
      ? "Invalid email or password."
      : error
        ? "Unable to sign in."
        : null);

  return (
    <form action={formAction} className="space-y-4">
      {callbackUrl ? (
        <input type="hidden" name="callbackUrl" value={callbackUrl} />
      ) : null}

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
