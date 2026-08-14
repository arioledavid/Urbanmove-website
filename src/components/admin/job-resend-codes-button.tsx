"use client";

import { useRouter } from "next/navigation";
import { useCallback, useState, useTransition } from "react";
import { AdminToast } from "@/components/admin/admin-toast";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { resendJobCodesAction } from "@/lib/actions/jobs";

type JobResendCodesButtonProps = {
  reference: string;
  contactEmail: string | null;
  emailDeliveryConfigured: boolean;
};

export function JobResendCodesButton({
  reference,
  contactEmail,
  emailDeliveryConfigured,
}: JobResendCodesButtonProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const dismissToast = useCallback(() => setToast(null), []);

  const email = contactEmail?.trim() || null;
  const blockedReason = !email
    ? "Add a customer email on this job before resending codes."
    : !emailDeliveryConfigured
      ? "Email delivery is not configured in this environment."
      : null;

  function confirm() {
    setError(null);
    startTransition(async () => {
      const result = await resendJobCodesAction(reference);
      if (!result.success) {
        setError(result.error);
        return;
      }
      setOpen(false);
      setToast(`New codes emailed to ${email}.`);
      router.refresh();
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setError(null);
          setOpen(true);
        }}
        disabled={Boolean(blockedReason)}
        title={blockedReason ?? undefined}
        className="inline-flex h-9 items-center rounded-md border border-border px-3 text-sm font-medium text-ink transition-transform duration-150 ease-out active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50 [@media(hover:hover)_and_(pointer:fine)]:hover:bg-surface"
      >
        Resend codes
      </button>

      <ConfirmDialog
        open={open}
        title="Resend pickup and drop-off codes?"
        description={
          email
            ? `This replaces the existing codes and emails new ones to ${email}. Anyone still holding the old codes will not be able to use them.`
            : "Add a customer email first."
        }
        confirmLabel="Resend codes"
        pending={pending}
        error={error}
        onConfirm={confirm}
        onCancel={() => {
          if (!pending) {
            setOpen(false);
            setError(null);
          }
        }}
      />

      <AdminToast
        open={Boolean(toast)}
        title="Codes resent"
        description={toast ?? ""}
        onClose={dismissToast}
      />
    </>
  );
}
