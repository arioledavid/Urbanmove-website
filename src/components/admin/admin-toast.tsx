"use client";

import { useEffect } from "react";
import { IconX } from "@tabler/icons-react";
import { cn } from "@/lib/utils";

type AdminToastProps = {
  open: boolean;
  title: string;
  description: string;
  tone?: "warning" | "info";
  onClose: () => void;
  /** Auto-dismiss after ms. Pass 0 to keep until closed. */
  durationMs?: number;
};

export function AdminToast({
  open,
  title,
  description,
  tone = "info",
  onClose,
  durationMs = 6000,
}: AdminToastProps) {
  useEffect(() => {
    if (!open || durationMs <= 0) return;
    const timer = window.setTimeout(onClose, durationMs);
    return () => window.clearTimeout(timer);
  }, [open, durationMs, onClose]);

  if (!open) return null;

  return (
    <div
      className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex justify-center p-4 sm:inset-x-auto sm:right-4 sm:bottom-4 sm:justify-end"
      role="status"
      aria-live="polite"
    >
      <div
        className={cn(
          "pointer-events-auto w-full max-w-sm rounded-lg border bg-paper p-4 shadow-sm",
          "motion-safe:animate-[confirm-in_180ms_ease-out]",
          tone === "warning"
            ? "border-[#F0E0A0]"
            : "border-border",
        )}
      >
        <div className="flex items-start gap-3">
          <div className="min-w-0 flex-1">
            <p
              className={cn(
                "text-sm font-semibold",
                tone === "warning" ? "text-[#8A6D00]" : "text-ink",
              )}
            >
              {title}
            </p>
            <p
              className={cn(
                "mt-1 text-sm text-pretty",
                tone === "warning" ? "text-[#8A6D00]/90" : "text-muted",
              )}
            >
              {description}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-muted transition-transform duration-150 ease-out active:scale-[0.97] [@media(hover:hover)_and_(pointer:fine)]:hover:bg-surface [@media(hover:hover)_and_(pointer:fine)]:hover:text-ink"
            aria-label="Dismiss"
          >
            <IconX className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
