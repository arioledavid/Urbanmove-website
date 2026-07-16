"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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
          "fixed inset-0 z-40 bg-ink/40 transition-opacity lg:hidden",
          mobileOpen ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        aria-hidden={!mobileOpen}
        onClick={onClose}
      />

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-border bg-paper transition-transform lg:static lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-16 items-center border-b border-border px-4">
          <Link href="/dashboard" onClick={onClose} className="flex items-center gap-2">
            <Logo className="h-10 w-auto" />
            <span className="text-sm font-semibold tracking-tight text-ink">
              Admin
            </span>
          </Link>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4">
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
                            "flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm transition-colors",
                            active
                              ? "bg-surface font-medium text-ink shadow-[inset_3px_0_0_0_var(--primary)]"
                              : "text-muted hover:bg-surface hover:text-ink",
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
