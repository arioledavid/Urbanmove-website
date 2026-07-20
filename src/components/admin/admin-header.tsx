"use client";

import { IconLogout, IconMenu2, IconX } from "@tabler/icons-react";
import { logoutAction } from "@/lib/actions/auth";

type AdminHeaderProps = {
  title: string;
  menuOpen: boolean;
  onMenuClick: () => void;
};

export function AdminHeader({
  title,
  menuOpen,
  onMenuClick,
}: AdminHeaderProps) {
  return (
    <header className="sticky top-0 z-30 flex min-h-14 items-center justify-between gap-3 border-b border-border bg-paper/95 px-4 py-1.5 pt-[max(0.375rem,env(safe-area-inset-top))] backdrop-blur-sm sm:min-h-16 sm:gap-4 sm:px-6 sm:py-0 sm:pt-[env(safe-area-inset-top)]">
      <div className="flex min-w-0 items-center gap-2 sm:gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-md border border-border text-ink transition-transform duration-150 ease-out active:scale-[0.97] lg:hidden [@media(hover:hover)_and_(pointer:fine)]:hover:bg-surface"
          aria-label={menuOpen ? "Close navigation" : "Open navigation"}
          aria-expanded={menuOpen}
          aria-controls="admin-sidebar"
        >
          {menuOpen ? (
            <IconX className="h-5 w-5" />
          ) : (
            <IconMenu2 className="h-5 w-5" />
          )}
        </button>
        <div className="min-w-0">
          <h2 className="truncate text-base font-semibold text-ink">{title}</h2>
        </div>
      </div>

      <form action={logoutAction}>
        <button
          type="submit"
          className="inline-flex h-11 items-center gap-2 rounded-md border border-border bg-paper px-3 text-sm font-medium text-ink transition-[transform,background-color] duration-150 ease-out active:scale-[0.97] [@media(hover:hover)_and_(pointer:fine)]:hover:bg-surface"
        >
          <IconLogout className="h-4 w-4 shrink-0" aria-hidden />
          Log out
        </button>
      </form>
    </header>
  );
}
