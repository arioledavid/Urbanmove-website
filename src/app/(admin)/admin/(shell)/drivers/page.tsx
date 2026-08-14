import Link from "next/link";
import { redirect } from "next/navigation";
import { DriverRowActions } from "@/components/admin/driver-row-actions";
import { PageHeader } from "@/components/admin/page-header";
import { formatAdminDateTime } from "@/lib/admin-format";
import { requireActiveSession } from "@/lib/admin-session";
import { prisma } from "@/lib/db/prisma";

export const metadata = { title: "Drivers" };

export default async function DriversPage() {
  const actor = await requireActiveSession();
  if (!actor.success || actor.data.role !== "ADMIN") {
    redirect("/jobs");
  }

  const drivers = await prisma.user.findMany({
    where: { role: "DRIVER" },
    select: {
      id: true,
      name: true,
      email: true,
      active: true,
      mustChangePassword: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const openJobs = await prisma.job.findMany({
    where: {
      status: { notIn: ["CANCELLED", "COMPLETED"] },
    },
    select: { assignedStaffIds: true },
  });
  const assignedJobCount = new Map<string, number>();
  for (const job of openJobs) {
    for (const id of job.assignedStaffIds) {
      assignedJobCount.set(id, (assignedJobCount.get(id) ?? 0) + 1);
    }
  }

  if (drivers.length === 0) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center px-4 text-center">
        <Link
          href="/drivers/new"
          className="inline-flex min-h-14 items-center justify-center rounded-md bg-ink px-6 text-base font-semibold text-paper transition-transform duration-150 ease-out active:scale-[0.98] [@media(hover:hover)_and_(pointer:fine)]:hover:bg-secondary-hover"
        >
          Create driver
        </Link>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Drivers"
        description="Crew accounts that can record pickup and drop-off on assigned jobs."
        actions={
          <Link
            href="/drivers/new"
            className="inline-flex h-9 items-center justify-center rounded-md bg-ink px-3 text-sm font-medium text-paper transition-transform duration-150 ease-out active:scale-[0.97] [@media(hover:hover)_and_(pointer:fine)]:hover:bg-secondary-hover"
          >
            Create driver
          </Link>
        }
      />

      <ul className="space-y-3 md:hidden">
        {drivers.map((driver) => {
          const openCount = assignedJobCount.get(driver.id) ?? 0;
          return (
            <li
              key={driver.id}
              className="rounded-lg border border-border bg-paper p-4"
            >
              <p className="font-medium text-ink">
                {driver.name?.trim() || driver.email}
              </p>
              {driver.name?.trim() ? (
                <p className="mt-0.5 text-sm text-muted">{driver.email}</p>
              ) : null}
              <dl className="mt-3 grid grid-cols-2 gap-2 text-xs">
                <div>
                  <dt className="text-muted">Status</dt>
                  <dd className="text-ink">
                    {!driver.active
                      ? "Inactive"
                      : driver.mustChangePassword
                        ? "Must change password"
                        : "Active"}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted">Open jobs</dt>
                  <dd className="text-ink tabular-nums">{openCount}</dd>
                </div>
                <div className="col-span-2">
                  <dt className="text-muted">Created</dt>
                  <dd className="text-ink">
                    {formatAdminDateTime(driver.createdAt)}
                  </dd>
                </div>
              </dl>
              <div className="mt-3">
                <DriverRowActions
                  driverId={driver.id}
                  active={driver.active}
                  email={driver.email}
                />
              </div>
            </li>
          );
        })}
      </ul>

      <div className="hidden overflow-x-auto rounded-lg border border-border bg-paper md:block">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-border bg-surface text-xs tracking-wide text-muted uppercase">
            <tr>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Open jobs</th>
              <th className="px-4 py-3 font-medium">Created</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {drivers.map((driver) => {
              const openCount = assignedJobCount.get(driver.id) ?? 0;
              return (
                <tr key={driver.id}>
                  <td className="px-4 py-3 text-ink">
                    {driver.name?.trim() || "—"}
                  </td>
                  <td className="px-4 py-3 text-muted">{driver.email}</td>
                  <td className="px-4 py-3 text-muted">
                    {!driver.active
                      ? "Inactive"
                      : driver.mustChangePassword
                        ? "Must change password"
                        : "Active"}
                  </td>
                  <td className="px-4 py-3 text-muted tabular-nums">
                    {openCount}
                  </td>
                  <td className="px-4 py-3 text-muted">
                    {formatAdminDateTime(driver.createdAt)}
                  </td>
                  <td className="px-4 py-3">
                    <DriverRowActions
                      driverId={driver.id}
                      active={driver.active}
                      email={driver.email}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
