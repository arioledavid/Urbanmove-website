import Link from "next/link";
import { auth } from "@/auth";
import { ActivityTimeline } from "@/components/admin/activity-timeline";
import { PageHeader } from "@/components/admin/page-header";
import { StatusBadge, jobStatusTone } from "@/components/admin/status-badge";
import {
  formatAdminDateTime,
  JOB_STATUS_LABELS,
} from "@/lib/admin-format";
import { addDays, dayBounds, dayKey } from "@/lib/calendar-month";
import { zonedWeekdayMon0 } from "@/lib/ops-time";
import { activityService } from "@/lib/services/activity-service";
import { enquiryService } from "@/lib/services/enquiry-service";
import { jobService } from "@/lib/services/job-service";

export const metadata = {
  title: "Dashboard",
};

function startOfToday(): Date {
  return dayBounds(new Date()).start;
}

function startOfWeek(): Date {
  const today = startOfToday();
  return addDays(today, -zonedWeekdayMon0(today));
}

function endOfWeek(): Date {
  return addDays(startOfWeek(), 7);
}

export default async function DashboardPage() {
  const session = await auth();

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const [
    newStatusCount,
    recentEnquiriesCount,
    todayJobsResult,
    weekJobsCount,
    activityResult,
  ] = await Promise.all([
    enquiryService.countByStatus("NEW"),
    enquiryService.countCreatedSince(sevenDaysAgo),
    jobService.listForDay(startOfToday()),
    jobService.countStartingBetween(startOfWeek(), endOfWeek()),
    activityService.listRecent(8),
  ]);

  const todayJobs = todayJobsResult.success ? todayJobsResult.data : [];
  const recentActivity = activityResult.success ? activityResult.data : [];

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description={`Signed in as ${session?.user.email ?? "unknown"}.`}
      />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
        <StatCard
          label="New enquiries"
          value={newStatusCount.success ? String(newStatusCount.data) : "—"}
          hint={
            recentEnquiriesCount.success
              ? `${recentEnquiriesCount.data} created in last 7 days`
              : "Status = New"
          }
          href="/enquiries?status=NEW"
        />
        <StatCard
          label="Today's jobs"
          value={String(todayJobs.length)}
          hint={`${formatAdminDateTime(startOfToday()).split(",")[0]}`}
          href={`/calendar/${dayKey(startOfToday())}`}
        />
        <StatCard
          label="This week's jobs"
          value={weekJobsCount.success ? String(weekJobsCount.data) : "—"}
          hint="Starting Mon–Sun"
          href="/jobs?status=SCHEDULED"
        />
      </div>

      <div className="mt-6 grid gap-6 sm:mt-8 lg:grid-cols-2">
        <section className="rounded-lg border border-border bg-paper">
          <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
            <h2 className="text-sm font-semibold text-ink">Today&apos;s jobs</h2>
            <Link
              href={`/calendar/${dayKey(startOfToday())}`}
              className="shrink-0 text-xs font-medium text-primary transition-opacity duration-150 active:opacity-70 [@media(hover:hover)_and_(pointer:fine)]:hover:underline"
            >
              Open day
            </Link>
          </div>
          {todayJobs.length === 0 ? (
            <p className="px-4 py-8 text-sm text-muted">
              No jobs scheduled for today.
            </p>
          ) : (
            <ul className="divide-y divide-border">
              {todayJobs.map((job) => (
                <li
                  key={job.id}
                  className="flex items-center justify-between gap-3 px-4 py-3.5"
                >
                  <div className="min-w-0">
                    <Link
                      href={`/jobs/${job.reference}`}
                      className="text-sm font-medium text-primary transition-opacity duration-150 active:opacity-70 [@media(hover:hover)_and_(pointer:fine)]:hover:underline"
                    >
                      {job.reference}
                    </Link>
                    <p className="truncate text-xs text-muted">{job.title}</p>
                  </div>
                  <StatusBadge
                    label={JOB_STATUS_LABELS[job.status]}
                    tone={jobStatusTone(job.status)}
                  />
                </li>
              ))}
            </ul>
          )}
        </section>

        <section>
          <h2 className="mb-3 text-sm font-semibold text-ink">Recent activity</h2>
          <ActivityTimeline items={recentActivity} />
        </section>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  hint,
  href,
}: {
  label: string;
  value: string;
  hint: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="rounded-lg border border-border bg-paper p-4 transition-[transform,border-color] duration-150 ease-out active:scale-[0.98] [@media(hover:hover)_and_(pointer:fine)]:hover:border-primary/40"
    >
      <p className="text-xs font-medium tracking-wide text-muted uppercase">
        {label}
      </p>
      <p className="mt-2 text-2xl font-semibold tabular-nums text-ink">
        {value}
      </p>
      <p className="mt-1 text-xs text-subtle">{hint}</p>
    </Link>
  );
}
