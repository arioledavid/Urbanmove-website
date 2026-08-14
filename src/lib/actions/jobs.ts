"use server";

import { revalidatePath } from "next/cache";
import type { JobStatus, ServiceType } from "@prisma/client";
import { requireEditSession } from "@/lib/admin-session";
import { parseOpsDateTimeLocal } from "@/lib/ops-time";
import type { Result } from "@/lib/result";
import { jobService } from "@/lib/services/job-service";

function parseOptionalDateTime(value: FormDataEntryValue | null): Date | null {
  if (typeof value !== "string" || !value.trim()) return null;
  return parseOpsDateTimeLocal(value);
}

const SERVICE_TYPES: ServiceType[] = ["REMOVAL", "COURIER", "CARGO", "OTHER"];

export async function createJobAction(
  formData: FormData,
): Promise<Result<{ reference: string }>> {
  const actor = await requireEditSession();
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
    { id: actor.data.id, role: actor.data.role },
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
): Promise<
  Result<{ reference: string; overlapWarnings: string[]; warnings: string[] }>
> {
  const actor = await requireEditSession();
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
      assignedStaffIds:
        formData.get("assignCrew") === "1"
          ? formData
              .getAll("assignedStaffIds")
              .filter((value): value is string => typeof value === "string")
          : undefined,
    },
    { id: actor.data.id, role: actor.data.role },
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
      warnings: result.data.warnings,
    },
  };
}

export async function deleteJobAction(
  reference: string,
): Promise<Result<{ reference: string }>> {
  const actor = await requireEditSession();
  if (!actor.success) return actor;

  const result = await jobService.delete(reference, {
    id: actor.data.id,
    role: actor.data.role,
  });
  if (!result.success) return result;

  revalidatePath("/jobs");
  revalidatePath("/admin/jobs");
  revalidatePath("/calendar", "layout");
  revalidatePath("/admin/calendar", "layout");
  revalidatePath("/dashboard");
  revalidatePath("/admin/dashboard");

  return { success: true, data: { reference: result.data.reference } };
}

export async function resendJobCodesAction(
  reference: string,
): Promise<Result<{ reference: string }>> {
  const actor = await requireEditSession();
  if (!actor.success) return actor;

  const result = await jobService.resendCodes(reference, {
    id: actor.data.id,
    role: actor.data.role,
  });
  if (!result.success) return result;

  revalidatePath(`/jobs/${reference}`);
  revalidatePath(`/admin/jobs/${reference}`);

  return { success: true, data: { reference: result.data.job.reference } };
}
