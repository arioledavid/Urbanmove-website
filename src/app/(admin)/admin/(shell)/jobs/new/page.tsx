import Link from "next/link";
import { JobCreateForm } from "@/components/admin/job-create-form";
import { PageHeader } from "@/components/admin/page-header";

export const metadata = { title: "Create job" };

export default function NewJobPage() {
  return (
    <div>
      <PageHeader
        title="Create job"
        description="Name, service, and date are required, everything else is optional."
        actions={
          <Link
            href="/jobs"
            className="inline-flex h-9 items-center rounded-md border border-border px-3 text-sm font-medium text-ink hover:bg-surface"
          >
            Back to list
          </Link>
        }
      />

      <div className="max-w-2xl">
        <JobCreateForm />
      </div>
    </div>
  );
}
