"use client";

import { useEffect, useId, useRef } from "react";
import { cn } from "@/lib/utils";

type ConfirmDialogProps = {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  pending?: boolean;
  /** Destructive actions use the primary (brand red) confirm button. */
  tone?: "danger" | "default";
  error?: string | null;
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  pending = false,
  tone = "default",
  error = null,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const titleId = useId();
  const descriptionId = useId();
  const cancelRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    cancelRef.current?.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !pending) {
        onCancel();
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, pending, onCancel]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center">
      <div
        className="absolute inset-0 bg-ink/40 motion-safe:animate-[fade-in_200ms_ease-out]"
        aria-hidden
        onClick={() => {
          if (!pending) onCancel();
        }}
      />

      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        className={cn(
          "relative z-10 w-full max-w-md rounded-lg border border-border bg-paper p-5",
          "motion-safe:animate-[confirm-in_180ms_ease-out]",
        )}
      >
        <h2 id={titleId} className="text-base font-semibold text-ink">
          {title}
        </h2>
        <p id={descriptionId} className="mt-2 text-sm text-muted text-pretty">
          {description}
        </p>

        {error ? (
          <p className="mt-3 text-sm text-primary" role="alert">
            {error}
          </p>
        ) : null}

        <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            ref={cancelRef}
            type="button"
            onClick={onCancel}
            disabled={pending}
            className="inline-flex h-10 items-center justify-center rounded-md border border-border px-4 text-sm font-medium text-ink transition-transform duration-150 ease-out active:scale-[0.97] disabled:opacity-60 [@media(hover:hover)_and_(pointer:fine)]:hover:bg-surface"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={pending}
            className={cn(
              "inline-flex h-10 items-center justify-center rounded-md px-4 text-sm font-medium text-paper transition-transform duration-150 ease-out active:scale-[0.97] disabled:opacity-60",
              tone === "danger"
                ? "bg-primary [@media(hover:hover)_and_(pointer:fine)]:hover:bg-primary-hover"
                : "bg-ink [@media(hover:hover)_and_(pointer:fine)]:hover:bg-secondary-hover",
            )}
          >
            {pending ? "Working…" : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
