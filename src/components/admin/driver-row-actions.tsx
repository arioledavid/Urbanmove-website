"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import {
  resetDriverPasswordAction,
  setDriverActiveAction,
} from "@/lib/actions/drivers";

type DriverRowActionsProps = {
  driverId: string;
  active: boolean;
  email: string;
};

export function DriverRowActions({
  driverId,
  active,
  email,
}: DriverRowActionsProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<"deactivate" | "reactivate" | "reset" | null>(
    null,
  );

  function runAction() {
    if (!confirm) return;
    setError(null);
    startTransition(async () => {
      const result =
        confirm === "reset"
          ? await resetDriverPasswordAction(driverId)
          : await setDriverActiveAction(driverId, confirm === "reactivate");

      if (!result.success) {
        setError(result.error);
        return;
      }

      setConfirm(null);
      router.refresh();
    });
  }

  return (
    <>
      <div className="flex flex-wrap gap-2">
        {active ? (
          <>
            <button
              type="button"
              onClick={() => {
                setError(null);
                setConfirm("reset");
              }}
              className="inline-flex h-8 items-center rounded-md border border-border px-2.5 text-xs font-medium text-ink transition-transform duration-150 ease-out active:scale-[0.97] [@media(hover:hover)_and_(pointer:fine)]:hover:bg-surface"
            >
              Reset password
            </button>
            <button
              type="button"
              onClick={() => {
                setError(null);
                setConfirm("deactivate");
              }}
              className="inline-flex h-8 items-center rounded-md border border-border px-2.5 text-xs font-medium text-ink transition-transform duration-150 ease-out active:scale-[0.97] [@media(hover:hover)_and_(pointer:fine)]:hover:bg-surface"
            >
              Deactivate
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={() => {
              setError(null);
              setConfirm("reactivate");
            }}
            className="inline-flex h-8 items-center rounded-md border border-border px-2.5 text-xs font-medium text-ink transition-transform duration-150 ease-out active:scale-[0.97] [@media(hover:hover)_and_(pointer:fine)]:hover:bg-surface"
          >
            Reactivate
          </button>
        )}
      </div>

      <ConfirmDialog
        open={confirm !== null}
        title={
          confirm === "reset"
            ? "Reset driver password?"
            : confirm === "deactivate"
              ? "Deactivate this driver?"
              : "Reactivate this driver?"
        }
        description={
          confirm === "reset"
            ? `A new temporary password will be emailed to ${email}. They must change it on next sign-in.`
            : confirm === "deactivate"
              ? `${email} will not be able to sign in until you reactivate them.`
              : `${email} will be able to sign in again.`
        }
        confirmLabel={
          confirm === "reset"
            ? "Reset password"
            : confirm === "deactivate"
              ? "Deactivate"
              : "Reactivate"
        }
        tone={confirm === "deactivate" ? "danger" : "default"}
        pending={pending}
        error={error}
        onConfirm={runAction}
        onCancel={() => {
          if (!pending) {
            setConfirm(null);
            setError(null);
          }
        }}
      />
    </>
  );
}
