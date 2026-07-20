"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { IconX } from "@tabler/icons-react";
import { Logo } from "@/components/brand/brand-logo";
import {
  ADMIN_NAV,
  ADMIN_NAV_SECTIONS,
} from "@/components/admin/nav-config";
import { cn } from "@/lib/utils";

type AdminSidebarProps = {
  mobileOpen: boolean;
  onClose: () => void;
  userEmail: string;
  userRole: string;
};

function isActive(pathname: string, href: string): boolean {
  const current = pathname.replace(/^\/admin/, "") || "/";
  if (href === "/dashboard") {
    return current === "/" || current === "/dashboard";
  }
  return current === href || current.startsWith(`${href}/`);
}

export function AdminSidebar({
  mobileOpen,
  onClose,
  userEmail,
  userRole,
}: AdminSidebarProps) {
  const pathname = usePathname();

  return (
    <>
      <div
        className={cn(
          "fixed inset-0 z-40 bg-ink/40 lg:hidden",
          "transition-opacity duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] motion-reduce:transition-none",
          mobileOpen ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        aria-hidden={!mobileOpen}
        onClick={onClose}
      />

      <aside
        id="admin-sidebar"
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-[min(18rem,calc(100vw-3rem))] flex-col border-r border-border bg-paper",
          "pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)] pl-[env(safe-area-inset-left)]",
          "transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] motion-reduce:transition-none",
          "lg:static lg:w-64 lg:translate-x-0 lg:pt-0 lg:pb-0 lg:pl-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
        aria-label="Admin navigation"
        {...(mobileOpen
          ? { role: "dialog", "aria-modal": true as const }
          : {})}
      >
        <div className="flex h-14 shrink-0 items-center justify-between gap-2 border-b border-border px-4 sm:h-16">
          <Link
            href="/dashboard"
            onClick={onClose}
            className="flex min-w-0 items-center gap-2 active:scale-[0.97] active:transition-transform active:duration-150"
          >
            <Logo className="h-9 w-auto sm:h-10" />
            <span className="text-sm font-semibold tracking-tight text-ink">
              Admin
            </span>
          </Link>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-11 w-11 items-center justify-center rounded-md text-ink transition-transform duration-150 ease-out active:scale-[0.97] lg:hidden [@media(hover:hover)_and_(pointer:fine)]:hover:bg-surface"
            aria-label="Close navigation"
          >
            <IconX className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto overscroll-contain px-3 py-4">
          {ADMIN_NAV_SECTIONS.map((section) => {
            const items = ADMIN_NAV.filter((item) => item.section === section);
            if (items.length === 0) return null;

            return (
              <div key={section} className="mb-5">
                <p className="mb-2 px-2 text-[11px] font-medium tracking-[0.08em] text-subtle uppercase">
                  {section}
                </p>
                <ul className="space-y-0.5">
                  {items.map((item) => {
                    const active = isActive(pathname, item.href);
                    const Icon = item.icon;
                    return (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          onClick={onClose}
                          className={cn(
                            "flex min-h-11 items-center gap-2.5 rounded-md px-2.5 py-2.5 text-sm transition-[color,background-color,transform] duration-150 ease-out active:scale-[0.98]",
                            active
                              ? "bg-surface font-medium text-ink shadow-[inset_3px_0_0_0_var(--primary)]"
                              : "text-muted [@media(hover:hover)_and_(pointer:fine)]:hover:bg-surface [@media(hover:hover)_and_(pointer:fine)]:hover:text-ink",
                            item.soon && !active ? "opacity-70" : null,
                          )}
                        >
                          <Icon className="h-4 w-4 shrink-0" aria-hidden />
                          <span className="flex-1">{item.label}</span>
                          {item.soon ? (
                            <span className="text-[10px] font-medium tracking-wide text-subtle uppercase">
                              Soon
                            </span>
                          ) : null}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </nav>

        <div className="border-t border-border px-4 py-3">
          <p className="truncate text-sm font-medium text-ink">{userEmail}</p>
          <p className="text-xs text-muted capitalize">{userRole.toLowerCase()}</p>
        </div>
      </aside>
    </>
  );
}
