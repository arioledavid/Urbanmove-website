"use client";

import { useState, useTransition } from "react";
import { PasswordInput } from "@/components/admin/password-input";
import {
  changePasswordAction,
  verifyCurrentPasswordAction,
} from "@/lib/actions/settings";
import { MIN_PASSWORD_LENGTH } from "@/lib/password-policy";

export function SettingsPasswordForm() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const passwordsMatch =
    newPassword.length > 0 &&
    confirmPassword.length > 0 &&
    newPassword === confirmPassword;
  const mismatch =
    confirmPassword.length > 0 && newPassword !== confirmPassword;
  const canSubmit =
    unlocked &&
    passwordsMatch &&
    newPassword.length >= MIN_PASSWORD_LENGTH &&
    !pending;

  function onVerify() {
    setError(null);
    const formData = new FormData();
    formData.set("currentPassword", currentPassword);

    startTransition(async () => {
      try {
        const result = await verifyCurrentPasswordAction(formData);
        if (!result.success) {
          setError(result.error);
          setUnlocked(false);
          return;
        }
        setUnlocked(true);
        setNewPassword("");
        setConfirmPassword("");
      } catch (err) {
        console.error("verifyCurrentPasswordAction failed:", err);
        setError("Something went wrong. Please try again.");
      }
    });
  }

  function onChangePassword() {
    setError(null);

    if (newPassword !== confirmPassword) {
      setError("New password and confirmation do not match.");
      return;
    }

    const formData = new FormData();
    formData.set("currentPassword", currentPassword);
    formData.set("newPassword", newPassword);
    formData.set("confirmPassword", confirmPassword);

    startTransition(async () => {
      try {
        const result = await changePasswordAction(formData);
        // signOut redirects; if we get a failure response, show it
        if (result && !result.success) {
          setError(result.error);
        }
      } catch (err) {
        // NEXT_REDIRECT from signOut is expected, the browser navigates to login
        const digest =
          err && typeof err === "object" && "digest" in err
            ? String((err as { digest?: unknown }).digest)
            : "";
        if (digest.startsWith("NEXT_REDIRECT")) {
          return;
        }
        console.error("changePasswordAction failed:", err);
        setError("Something went wrong. Please try again.");
      }
    });
  }

  return (
    <div className="space-y-4">
      <div>
        <label
          htmlFor="currentPassword"
          className="mb-1 block text-xs font-medium text-muted"
        >
          Current password
        </label>
        <PasswordInput
          id="currentPassword"
          name="currentPassword"
          autoComplete="current-password"
          value={currentPassword}
          onChange={(e) => {
            setCurrentPassword(e.target.value);
            if (unlocked) {
              setUnlocked(false);
              setNewPassword("");
              setConfirmPassword("");
            }
          }}
          disabled={pending}
          required
        />
      </div>

      {!unlocked ? (
        <button
          type="button"
          onClick={onVerify}
          disabled={pending || currentPassword.length < MIN_PASSWORD_LENGTH}
          className="inline-flex h-9 items-center rounded-md border border-border px-3 text-sm font-medium text-ink hover:bg-surface disabled:opacity-60"
        >
          {pending ? "Checking…" : "Continue"}
        </button>
      ) : (
        <>
          <div>
            <label
              htmlFor="newPassword"
              className="mb-1 block text-xs font-medium text-muted"
            >
              New password
            </label>
            <PasswordInput
              id="newPassword"
              name="newPassword"
              autoComplete="new-password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              minLength={MIN_PASSWORD_LENGTH}
              disabled={pending}
              required
            />
            <p className="mt-1 text-xs text-subtle">
              At least {MIN_PASSWORD_LENGTH} characters.
            </p>
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="mb-1 block text-xs font-medium text-muted"
            >
              Confirm new password
            </label>
            <PasswordInput
              id="confirmPassword"
              name="confirmPassword"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              minLength={MIN_PASSWORD_LENGTH}
              disabled={pending}
              required
              aria-invalid={mismatch || undefined}
            />
            {mismatch ? (
              <p className="mt-1 text-xs text-primary" role="alert">
                Passwords do not match.
              </p>
            ) : null}
          </div>

          <button
            type="button"
            onClick={onChangePassword}
            disabled={!canSubmit}
            className="inline-flex h-9 items-center rounded-md bg-primary px-3 text-sm font-medium text-paper transition-colors hover:bg-primary-hover disabled:opacity-60"
          >
            {pending ? "Updating…" : "Change password"}
          </button>
        </>
      )}

      {error ? (
        <p className="text-sm text-primary" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
