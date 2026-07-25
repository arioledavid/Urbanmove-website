"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { deleteJobAction } from "@/lib/actions/jobs";

type JobDeleteButtonProps = {
  reference: string;
};

export function JobDeleteButton({ reference }: JobDeleteButtonProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function openDialog() {
    setError(null);
    setOpen(true);
  }

  function closeDialog() {
    if (pending) return;
    setOpen(false);
    setError(null);
  }

  function confirmDelete() {
    setError(null);
    startTransition(async () => {
      try {
        const result = await deleteJobAction(reference);
        if (!result.success) {
          setError(result.error);
          return;
        }
        setOpen(false);
        router.push("/jobs");
        router.refresh();
      } catch (err) {
        console.error("deleteJobAction failed:", err);
        setError("Something went wrong. Please try again.");
      }
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={openDialog}
        disabled={pending}
        className="inline-flex h-9 items-center justify-center rounded-md border border-primary/30 px-3 text-sm font-medium text-primary transition-transform duration-150 ease-out active:scale-[0.97] disabled:opacity-60 [@media(hover:hover)_and_(pointer:fine)]:hover:bg-[#FDECEC]"
      >
        Delete job
      </button>

      <ConfirmDialog
        open={open}
        title="Delete job?"
        description={`Delete ${reference}? This cannot be undone.`}
        confirmLabel="Delete job"
        cancelLabel="Keep job"
        tone="danger"
        pending={pending}
        error={error}
        onConfirm={confirmDelete}
        onCancel={closeDialog}
      />
    </>
  );
}
