"use server";

import { revalidatePath } from "next/cache";
import type { JobStatus } from "@prisma/client";
import { auth } from "@/auth";
import type { Result } from "@/lib/result";
import { jobService } from "@/lib/services/job-service";

async function requireActorId(): Promise<Result<string>> {
  const session = await auth();
  if (!session?.user?.id || session.user.active === false) {
    return { success: false, error: "You must be signed in." };
  }
  return { success: true, data: session.user.id };
}

function parseOptionalDateTime(value: FormDataEntryValue | null): Date | null {
  if (typeof value !== "string" || !value.trim()) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export async function updateJobAction(
  reference: string,
  formData: FormData,
): Promise<Result<{ reference: string; overlapWarnings: string[] }>> {
  const actor = await requireActorId();
  if (!actor.success) return actor;

  const status = String(formData.get("status") ?? "") as JobStatus;
  const title = String(formData.get("title") ?? "");
  const addressFrom = String(formData.get("addressFrom") ?? "");
  const addressTo = String(formData.get("addressTo") ?? "");
  const notes = String(formData.get("notes") ?? "");

  const result = await jobService.update(
    reference,
    {
      title,
      status,
      addressFrom,
      addressTo,
      notes,
      scheduledStart: parseOptionalDateTime(formData.get("scheduledStart")),
      scheduledEnd: parseOptionalDateTime(formData.get("scheduledEnd")),
    },
    actor.data,
  );

  if (!result.success) return result;

  revalidatePath("/jobs");
  revalidatePath(`/jobs/${reference}`);
  revalidatePath("/admin/jobs");
  revalidatePath(`/admin/jobs/${reference}`);
  revalidatePath("/calendar");
  revalidatePath("/admin/calendar");
  revalidatePath("/dashboard");
  revalidatePath("/admin/dashboard");
  revalidatePath("/enquiries");
  revalidatePath("/admin/enquiries");

  return {
    success: true,
    data: {
      reference: result.data.job.reference,
      overlapWarnings: result.data.overlapWarnings,
    },
  };
}
