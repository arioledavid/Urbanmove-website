"use server";

import { revalidatePath } from "next/cache";
import type { JobStatus, ServiceType } from "@prisma/client";
import { auth } from "@/auth";
import { parseOpsDateTimeLocal } from "@/lib/ops-time";
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
  return parseOpsDateTimeLocal(value);
}

const SERVICE_TYPES: ServiceType[] = ["REMOVAL", "COURIER", "CARGO", "OTHER"];

export async function createJobAction(
  formData: FormData,
): Promise<Result<{ reference: string }>> {
  const actor = await requireActorId();
  if (!actor.success) return actor;

  const serviceType = String(formData.get("serviceType") ?? "") as ServiceType;
  if (!SERVICE_TYPES.includes(serviceType)) {
    return { success: false, error: "Invalid service type." };
  }

  const scheduledStart = parseOptionalDateTime(formData.get("scheduledStart"));
  if (!scheduledStart) {
    return { success: false, error: "Scheduled date is required." };
  }

  const result = await jobService.create(
    {
      contactName: String(formData.get("contactName") ?? ""),
      contactEmail: String(formData.get("contactEmail") ?? ""),
      contactPhone: String(formData.get("contactPhone") ?? ""),
      serviceType,
      title: String(formData.get("title") ?? ""),
      addressFrom: String(formData.get("addressFrom") ?? ""),
      addressTo: String(formData.get("addressTo") ?? ""),
      notes: String(formData.get("notes") ?? ""),
      scheduledStart,
    },
    actor.data,
  );

  if (!result.success) return result;

  revalidatePath("/jobs");
  revalidatePath("/admin/jobs");
  revalidatePath("/calendar", "layout");
  revalidatePath("/admin/calendar", "layout");
  revalidatePath("/dashboard");
  revalidatePath("/admin/dashboard");

  return { success: true, data: { reference: result.data.reference } };
}

export async function updateJobAction(
  reference: string,
  formData: FormData,
): Promise<Result<{ reference: string; overlapWarnings: string[] }>> {
  const actor = await requireActorId();
  if (!actor.success) return actor;

  const status = String(formData.get("status") ?? "") as JobStatus;
  const title = String(formData.get("title") ?? "");
  const contactName = String(formData.get("contactName") ?? "").trim();
  const contactEmail = String(formData.get("contactEmail") ?? "");
  const contactPhone = String(formData.get("contactPhone") ?? "");
  const addressFrom = String(formData.get("addressFrom") ?? "");
  const addressTo = String(formData.get("addressTo") ?? "");
  const notes = String(formData.get("notes") ?? "");

  if (!contactName) {
    return { success: false, error: "Contact name is required." };
  }

  const result = await jobService.update(
    reference,
    {
      title,
      status,
      contactName,
      contactEmail,
      contactPhone,
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
  revalidatePath("/calendar", "layout");
  revalidatePath("/admin/calendar", "layout");
  revalidatePath("/dashboard");
  revalidatePath("/admin/dashboard");

  return {
    success: true,
    data: {
      reference: result.data.job.reference,
      overlapWarnings: result.data.overlapWarnings,
    },
  };
}

export async function deleteJobAction(
  reference: string,
): Promise<Result<{ reference: string }>> {
  const actor = await requireActorId();
  if (!actor.success) return actor;

  const result = await jobService.delete(reference, actor.data);
  if (!result.success) return result;

  revalidatePath("/jobs");
  revalidatePath("/admin/jobs");
  revalidatePath("/calendar", "layout");
  revalidatePath("/admin/calendar", "layout");
  revalidatePath("/dashboard");
  revalidatePath("/admin/dashboard");

  return { success: true, data: { reference: result.data.reference } };
}
