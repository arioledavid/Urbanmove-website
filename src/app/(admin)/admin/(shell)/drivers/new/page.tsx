import Link from "next/link";
import { redirect } from "next/navigation";
import { CreateDriverForm } from "@/components/admin/create-driver-form";
import { PageHeader } from "@/components/admin/page-header";
import { requireActiveSession } from "@/lib/admin-session";

export const metadata = { title: "Create driver" };

export default async function NewDriverPage() {
  const actor = await requireActiveSession();
  if (!actor.success || actor.data.role !== "ADMIN") {
    redirect("/jobs");
  }

  return (
    <div>
      <PageHeader
        title="Create driver"
        description="We’ll email them a temporary password. They must change it on first sign-in."
        actions={
          <Link
            href="/drivers"
            className="inline-flex h-9 items-center rounded-md border border-border px-3 text-sm font-medium text-ink hover:bg-surface"
          >
            Back to drivers
          </Link>
        }
      />

      <div className="max-w-lg rounded-lg border border-border bg-paper p-4 sm:p-5">
        <CreateDriverForm />
      </div>
    </div>
  );
}
