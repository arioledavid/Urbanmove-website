"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { AdminHeader } from "@/components/admin/admin-header";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { getAdminPageMeta } from "@/components/admin/nav-config";

type AdminShellProps = {
  userEmail: string;
  userRole: string;
  children: React.ReactNode;
};

export function AdminShell({
  userEmail,
  userRole,
  children,
}: AdminShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const { title } = getAdminPageMeta(pathname);

  return (
    <div className="flex min-h-full bg-surface">
      <AdminSidebar
        mobileOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
        userEmail={userEmail}
        userRole={userRole}
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <AdminHeader
          title={title}
          onMenuClick={() => setMobileOpen(true)}
        />
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
