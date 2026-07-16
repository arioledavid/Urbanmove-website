"use server";

import { revalidatePath } from "next/cache";
import type { EnquiryStatus } from "@prisma/client";
import { auth } from "@/auth";
import type { Result } from "@/lib/result";
import { enquiryService } from "@/lib/services/enquiry-service";
import { jobService } from "@/lib/services/job-service";

async function requireActorId(): Promise<Result<string>> {
  const session = await auth();
  if (!session?.user?.id || session.user.active === false) {
    return { success: false, error: "You must be signed in." };
  }
  return { success: true, data: session.user.id };
}

function revalidateEnquiryPaths(reference: string) {
  // Clean admin-host URLs (what the browser uses) + internal /admin paths
  revalidatePath("/enquiries");
  revalidatePath(`/enquiries/${reference}`);
  revalidatePath("/admin/enquiries");
  revalidatePath(`/admin/enquiries/${reference}`);
  revalidatePath("/dashboard");
  revalidatePath("/admin/dashboard");
}

export async function updateEnquiryStatusAction(
  reference: string,
  newStatus: EnquiryStatus,
): Promise<Result<{ reference: string }>> {
  const actor = await requireActorId();
  if (!actor.success) return actor;

  const result = await enquiryService.updateStatus(
    reference,
    newStatus,
    actor.data,
  );
  if (!result.success) return result;

  revalidateEnquiryPaths(result.data.reference);
  return { success: true, data: { reference: result.data.reference } };
}

export async function convertEnquiryToJobAction(
  enquiryId: string,
  enquiryReference: string,
): Promise<Result<{ jobReference: string }>> {
  const actor = await requireActorId();
  if (!actor.success) return actor;

  const result = await jobService.createFromEnquiry(enquiryId, actor.data);
  if (!result.success) return result;

  revalidateEnquiryPaths(enquiryReference);
  revalidatePath("/jobs");
  revalidatePath(`/jobs/${result.data.reference}`);
  revalidatePath("/admin/jobs");
  revalidatePath(`/admin/jobs/${result.data.reference}`);
  revalidatePath("/calendar");
  revalidatePath("/admin/calendar");

  return { success: true, data: { jobReference: result.data.reference } };
}
