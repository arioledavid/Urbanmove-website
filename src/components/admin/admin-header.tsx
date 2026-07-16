"use client";

import { IconLogout, IconMenu2 } from "@tabler/icons-react";
import { logoutAction } from "@/lib/actions/auth";

type AdminHeaderProps = {
  title: string;
  onMenuClick: () => void;
};

export function AdminHeader({ title, onMenuClick }: AdminHeaderProps) {
  return (
    <header className="flex h-16 items-center justify-between gap-4 border-b border-border bg-paper px-4 sm:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border text-ink lg:hidden"
          aria-label="Open navigation"
        >
          <IconMenu2 className="h-5 w-5" />
        </button>
        <div className="min-w-0">
          <h2 className="truncate text-base font-semibold text-ink">{title}</h2>
        </div>
      </div>

      <form action={logoutAction}>
        <button
          type="submit"
          className="inline-flex h-9 items-center gap-2 rounded-md border border-border bg-paper px-3 text-sm font-medium text-ink transition-colors hover:bg-surface"
        >
          <IconLogout className="h-4 w-4" aria-hidden />
          Log out
        </button>
      </form>
    </header>
  );
}
