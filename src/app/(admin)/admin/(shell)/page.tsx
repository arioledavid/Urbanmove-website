import { redirect } from "next/navigation";
import { canManageJobs } from "@/lib/admin-access";
import { requireActiveSession } from "@/lib/admin-session";

export default async function AdminIndexPage() {
  const actor = await requireActiveSession();
  if (actor.success && !canManageJobs(actor.data.role)) {
    redirect("/jobs");
  }
  redirect("/dashboard");
}
