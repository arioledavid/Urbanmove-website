import type { ComponentType, SVGProps } from "react";
import {
  IconBriefcase,
  IconBuildingWarehouse,
  IconCalendar,
  IconCash,
  IconChartBar,
  IconFileDescription,
  IconInbox,
  IconLayoutDashboard,
  IconSettings,
  IconTruck,
  IconUserCog,
  IconUsers,
} from "@tabler/icons-react";

export type AdminNavItem = {
  label: string;
  href: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  soon?: boolean;
  section: "Overview" | "Operations" | "Commercial" | "Fleet & people" | "System";
};

export const ADMIN_NAV: AdminNavItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: IconLayoutDashboard,
    section: "Overview",
  },
  {
    label: "Enquiries",
    href: "/enquiries",
    icon: IconInbox,
    section: "Operations",
  },
  {
    label: "Jobs",
    href: "/jobs",
    icon: IconBriefcase,
    section: "Operations",
  },
  {
    label: "Calendar",
    href: "/calendar",
    icon: IconCalendar,
    section: "Operations",
  },
  {
    label: "Customers",
    href: "/customers",
    icon: IconUsers,
    soon: true,
    section: "Commercial",
  },
  {
    label: "Quotes",
    href: "/quotes",
    icon: IconFileDescription,
    soon: true,
    section: "Commercial",
  },
  {
    label: "Payments",
    href: "/payments",
    icon: IconCash,
    soon: true,
    section: "Commercial",
  },
  {
    label: "Staff",
    href: "/staff",
    icon: IconUserCog,
    soon: true,
    section: "Fleet & people",
  },
  {
    label: "Vehicles",
    href: "/vehicles",
    icon: IconTruck,
    soon: true,
    section: "Fleet & people",
  },
  {
    label: "Storage",
    href: "/storage",
    icon: IconBuildingWarehouse,
    soon: true,
    section: "Fleet & people",
  },
  {
    label: "Reports",
    href: "/reports",
    icon: IconChartBar,
    soon: true,
    section: "System",
  },
  {
    label: "Settings",
    href: "/settings",
    icon: IconSettings,
    soon: true,
    section: "System",
  },
];

export const ADMIN_NAV_SECTIONS = [
  "Overview",
  "Operations",
  "Commercial",
  "Fleet & people",
  "System",
] as const;

export function getAdminPageMeta(pathname: string): {
  title: string;
  soon: boolean;
} {
  const normalized =
    pathname === "/admin" || pathname === "/"
      ? "/dashboard"
      : pathname.replace(/^\/admin/, "") || "/dashboard";

  const item = ADMIN_NAV.find(
    (nav) =>
      normalized === nav.href || normalized.startsWith(`${nav.href}/`),
  );

  return {
    title: item?.label ?? "Admin",
    soon: item?.soon ?? false,
  };
}
