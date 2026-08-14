import type { Job, JobStatus, Prisma, Role, ServiceType } from "@prisma/client";
import { dayBounds } from "@/lib/calendar-month";
import { canEditJobs, canTrackJob } from "@/lib/admin-access";
import { prisma } from "@/lib/db/prisma";
import { sendJobCodesEmail } from "@/lib/emails/job-codes-email";
import { sendJobCompletionEmail } from "@/lib/emails/job-completion-email";
import {
  generateSixDigitCode,
  hashJobCode,
  isSixDigitCode,
  verifyJobCode,
} from "@/lib/job-codes";
import { canDeleteJob, isJobTransitionAllowed } from "@/lib/job-workflow";
import { isPastOpsDateTime } from "@/lib/ops-time";
import { err, ok, type Result } from "@/lib/result";
import { activityService } from "@/lib/services/activity-service";
import { referenceService } from "@/lib/services/reference-service";

export type ListJobsInput = {
  status?: JobStatus | "ALL";
  take?: number;
  assignedStaffId?: string;
};

export type JobPhotoInput = {
  url: string;
  publicId: string;
};

export type JobActor = {
  id: string;
  role: Role;
};

export type CreateJobInput = {
  contactName: string;
  contactEmail?: string | null;
  contactPhone?: string | null;
  serviceType: ServiceType;
  title?: string | null;
  addressFrom?: string | null;
  addressTo?: string | null;
  notes?: string | null;
  scheduledStart: Date;
};

export type UpdateJobInput = {
  scheduledStart?: Date | null;
  scheduledEnd?: Date | null;
  status?: JobStatus;
  addressFrom?: string | null;
  addressTo?: string | null;
  notes?: string | null;
  title?: string | null;
  contactName?: string | null;
  contactEmail?: string | null;
  contactPhone?: string | null;
  assignedStaffIds?: string[];
};

const JOB_STATUS_LABELS: Record<JobStatus, string> = {
  DRAFT: "Draft",
  SCHEDULED: "Scheduled",
  IN_PROGRESS: "In progress",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

const SERVICE_TYPES: ServiceType[] = ["REMOVAL", "COURIER", "CARGO", "OTHER"];

function rangesOverlap(
  aStart: Date,
  aEnd: Date,
  bStart: Date,
  bEnd: Date,
): boolean {
  return aStart < bEnd && bStart < aEnd;
}

function durationMinutes(start: Date, end: Date): number {
  return Math.max(
    0,
    Math.round((end.getTime() - start.getTime()) / 60_000),
  );
}

function assertCanEditJob(actor: JobActor): Result<void> {
  if (!canEditJobs(actor.role)) {
    return err("You do not have access to edit jobs.");
  }
  return ok(undefined);
}

function assertCanTrackJob(
  job: Pick<Job, "assignedStaffIds">,
  actor: JobActor,
): Result<void> {
  if (!canTrackJob(actor.role, actor.id, job.assignedStaffIds)) {
    return err("You do not have access to this job.");
  }
  return ok(undefined);
}

/**
 * Jobs are created manually (from converted email leads) as DRAFT.
 * Name, service, and scheduled start are required at creation; other fields are optional.
 */
export const jobService = {
  async create(
    input: CreateJobInput,
    actor: JobActor,
  ): Promise<Result<Job>> {
    try {
      const access = assertCanEditJob(actor);
      if (!access.success) return access;

      const contactName = input.contactName.trim();
      const contactEmail = input.contactEmail?.trim() || null;
      const contactPhone = input.contactPhone?.trim() || null;

      if (!contactName) return err("Contact name is required.");
      if (!SERVICE_TYPES.includes(input.serviceType)) {
        return err("Invalid service type.");
      }
      if (
        !(input.scheduledStart instanceof Date) ||
        Number.isNaN(input.scheduledStart.getTime())
      ) {
        return err("Scheduled date is required.");
      }

      const referenceResult = await referenceService.next("job");
      if (!referenceResult.success) return referenceResult;

      const title =
        input.title?.trim() ||
        `${input.serviceType} - ${contactName}`;

      const job = await prisma.job.create({
        data: {
          reference: referenceResult.data,
          title,
          serviceType: input.serviceType,
          contactName,
          contactEmail,
          contactPhone,
          addressFrom: input.addressFrom?.trim() || null,
          addressTo: input.addressTo?.trim() || null,
          notes: input.notes?.trim() || null,
          scheduledStart: input.scheduledStart,
          status: "DRAFT",
          pickupPhotos: [],
          dropoffPhotos: [],
        },
      });

      await activityService.log({
        type: "JOB_CREATED",
        entityType: "Job",
        entityId: job.id,
        entityReference: job.reference,
        message: `Job ${job.reference} created`,
        actorId: actor.id,
      });

      return ok(job);
    } catch (error) {
      console.error("jobService.create failed:", error);
      return err("Unable to create job.");
    }
  },

  async list(input: ListJobsInput = {}): Promise<Result<Job[]>> {
    try {
      const where: Prisma.JobWhereInput = {};
      if (input.status && input.status !== "ALL") {
        where.status = input.status;
      }
      if (input.assignedStaffId) {
        where.assignedStaffIds = { has: input.assignedStaffId };
      }

      const rows = await prisma.job.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: input.take ?? 100,
      });

      return ok(rows);
    } catch (error) {
      console.error("jobService.list failed:", error);
      return err("Unable to load jobs.");
    }
  },

  async getByReference(reference: string): Promise<Result<Job>> {
    try {
      const job = await prisma.job.findUnique({
        where: { reference: reference.trim() },
      });

      if (!job) {
        return err("Job not found.");
      }

      return ok(job);
    } catch (error) {
      console.error("jobService.getByReference failed:", error);
      return err("Unable to load job.");
    }
  },

  async getById(id: string): Promise<Result<Job>> {
    try {
      if (!/^[a-f\d]{24}$/i.test(id)) {
        return err("Job not found.");
      }

      const job = await prisma.job.findUnique({ where: { id } });
      if (!job) {
        return err("Job not found.");
      }

      return ok(job);
    } catch (error) {
      console.error("jobService.getById failed:", error);
      return err("Unable to load job.");
    }
  },

  async findOverlapping(
    start: Date,
    end: Date,
    excludeJobId?: string,
  ): Promise<Result<Job[]>> {
    try {
      if (!(start instanceof Date) || !(end instanceof Date) || start >= end) {
        return err("Invalid schedule range for overlap check.");
      }

      const candidates = await prisma.job.findMany({
        where: {
          id: excludeJobId ? { not: excludeJobId } : undefined,
          scheduledStart: { not: null },
          scheduledEnd: { not: null },
          status: { notIn: ["CANCELLED"] },
        },
      });

      const overlapping = candidates.filter((job) => {
        if (!job.scheduledStart || !job.scheduledEnd) return false;
        return rangesOverlap(start, end, job.scheduledStart, job.scheduledEnd);
      });

      return ok(overlapping);
    } catch (error) {
      console.error("jobService.findOverlapping failed:", error);
      return err("Unable to check for overlapping jobs.");
    }
  },

  async update(
    reference: string,
    input: UpdateJobInput,
    actor: JobActor,
  ): Promise<Result<{ job: Job; overlapWarnings: string[]; warnings: string[] }>> {
    try {
      const access = assertCanEditJob(actor);
      if (!access.success) return access;

      const existing = await prisma.job.findUnique({
        where: { reference: reference.trim() },
      });

      if (!existing) {
        return err("Job not found.");
      }

      const nextStart =
        input.scheduledStart !== undefined
          ? input.scheduledStart
          : existing.scheduledStart;
      const nextEnd =
        input.scheduledEnd !== undefined
          ? input.scheduledEnd
          : existing.scheduledEnd;

      if (nextStart && nextEnd && nextStart >= nextEnd) {
        return err("Scheduled end must be after scheduled start.");
      }

      const nextStatus =
        input.status !== undefined ? input.status : existing.status;

      if (
        (nextStatus === "SCHEDULED" || nextStatus === "IN_PROGRESS") &&
        nextStart &&
        isPastOpsDateTime(nextStart)
      ) {
        return err("Scheduled start cannot be in the past.");
      }

      if (
        input.status !== undefined &&
        input.status !== existing.status &&
        !isJobTransitionAllowed(existing.status, input.status)
      ) {
        return err(
          `Cannot change status from ${JOB_STATUS_LABELS[existing.status]} to ${JOB_STATUS_LABELS[input.status]}.`,
        );
      }

      const overlapWarnings: string[] = [];
      if (nextStart && nextEnd) {
        const overlaps = await this.findOverlapping(
          nextStart,
          nextEnd,
          existing.id,
        );
        if (overlaps.success) {
          for (const job of overlaps.data) {
            overlapWarnings.push(
              `${job.reference} (${JOB_STATUS_LABELS[job.status]})`,
            );
          }
        }
      }

      const data: Prisma.JobUpdateInput = {};
      if (input.scheduledStart !== undefined) {
        data.scheduledStart = input.scheduledStart;
      }
      if (input.scheduledEnd !== undefined) {
        data.scheduledEnd = input.scheduledEnd;
      }
      if (input.status !== undefined) data.status = input.status;
      if (input.addressFrom !== undefined) {
        data.addressFrom = input.addressFrom?.trim() || null;
      }
      if (input.addressTo !== undefined) {
        data.addressTo = input.addressTo?.trim() || null;
      }
      if (input.notes !== undefined) {
        data.notes = input.notes?.trim() || null;
      }
      if (input.title !== undefined && input.title?.trim()) {
        data.title = input.title.trim();
      }
      if (input.contactName !== undefined) {
        const name = input.contactName?.trim() ?? "";
        if (!name) return err("Contact name is required.");
        data.contactName = name;
      }
      if (input.contactEmail !== undefined) {
        data.contactEmail = input.contactEmail?.trim() || null;
      }
      if (input.contactPhone !== undefined) {
        data.contactPhone = input.contactPhone?.trim() || null;
      }
      if (input.assignedStaffIds !== undefined) {
        data.assignedStaffIds = {
          set: input.assignedStaffIds.filter((id) =>
            /^[a-f\d]{24}$/i.test(id),
          ),
        };
      }

      const transitioningToScheduled =
        input.status === "SCHEDULED" && existing.status !== "SCHEDULED";

      let pickupCode: string | null = null;
      let dropoffCode: string | null = null;

      if (transitioningToScheduled) {
        pickupCode = generateSixDigitCode();
        dropoffCode = generateSixDigitCode();
        data.pickupCodeHash = await hashJobCode(pickupCode);
        data.dropoffCodeHash = await hashJobCode(dropoffCode);
      }

      const updated = await prisma.job.update({
        where: { id: existing.id },
        data,
      });

      const statusChanged =
        input.status !== undefined && input.status !== existing.status;

      if (statusChanged) {
        await activityService.log({
          type: "JOB_STATUS_CHANGED",
          entityType: "Job",
          entityId: updated.id,
          entityReference: updated.reference,
          message: `Job ${updated.reference} status changed to ${JOB_STATUS_LABELS[updated.status]}`,
          actorId: actor.id,
          metadata: { from: existing.status, to: updated.status },
        });
      } else {
        await activityService.log({
          type: "JOB_UPDATED",
          entityType: "Job",
          entityId: updated.id,
          entityReference: updated.reference,
          message: `Job ${updated.reference} updated`,
          actorId: actor.id,
        });
      }

      const warnings: string[] = [];

      if (transitioningToScheduled && pickupCode && dropoffCode) {
        const emailTo = updated.contactEmail?.trim() || null;
        if (!emailTo) {
          console.error(
            "jobService.update: no contactEmail; pickup/dropoff codes not sent",
            { jobId: updated.id, reference: updated.reference },
          );
          warnings.push(
            "Job scheduled, but there is no customer email on this job, so pickup/dropoff codes were not sent.",
          );
        } else {
          const sent = await sendJobCodesEmail({
            to: emailTo,
            contactName: updated.contactName,
            jobReference: updated.reference,
            pickupCode,
            dropoffCode,
          });
          pickupCode = null;
          dropoffCode = null;

          if (!sent.success) {
            console.error("jobService.update: codes email failed", {
              jobId: updated.id,
              reference: updated.reference,
              error: sent.error,
            });
            warnings.push(
              "Job scheduled, but the pickup/dropoff codes email could not be sent.",
            );
          } else {
            await activityService.log({
              type: "JOB_UPDATED",
              entityType: "Job",
              entityId: updated.id,
              entityReference: updated.reference,
              message: "Pickup/dropoff codes sent to customer",
              actorId: actor.id,
            });
          }
        }
      }

      return ok({ job: updated, overlapWarnings, warnings });
    } catch (error) {
      console.error("jobService.update failed:", error);
      return err("Unable to update job.");
    }
  },

  /**
   * Generate fresh pickup/dropoff codes, replace hashes, and email the customer.
   * Allowed while the job still has unused codes (before drop-off is finalized).
   */
  async resendCodes(
    reference: string,
    actor: JobActor,
  ): Promise<Result<{ job: Job }>> {
    try {
      const access = assertCanEditJob(actor);
      if (!access.success) return access;

      const existing = await prisma.job.findUnique({
        where: { reference: reference.trim() },
      });
      if (!existing) {
        return err("Job not found.");
      }

      if (existing.droppedOffAt || existing.status === "COMPLETED") {
        return err("Codes cannot be resent after the job is completed.");
      }
      if (existing.status === "CANCELLED" || existing.status === "DRAFT") {
        return err("Schedule the job before sending codes.");
      }
      if (!existing.pickupCodeHash && !existing.dropoffCodeHash) {
        return err("This job has no codes to replace yet.");
      }

      const emailTo = existing.contactEmail?.trim() || null;
      if (!emailTo) {
        return err(
          "Add a customer email on this job before resending codes.",
        );
      }

      const pickupCode = generateSixDigitCode();
      const dropoffCode = generateSixDigitCode();
      const pickupCodeHash = await hashJobCode(pickupCode);
      const dropoffCodeHash = await hashJobCode(dropoffCode);

      const data: Prisma.JobUpdateInput = {
        pickupCodeHash,
        dropoffCodeHash,
      };
      // If pickup already happened, keep verification timestamps; only dropoff
      // code needs to work going forward. Regenerating both is still fine.
      if (existing.pickupVerifiedAt && !existing.pickedUpAt) {
        data.pickupVerifiedAt = null;
      }
      if (existing.dropoffVerifiedAt) {
        data.dropoffVerifiedAt = null;
      }

      const updated = await prisma.job.update({
        where: { id: existing.id },
        data,
      });

      const sent = await sendJobCodesEmail({
        to: emailTo,
        contactName: updated.contactName,
        jobReference: updated.reference,
        pickupCode,
        dropoffCode,
      });

      if (!sent.success) {
        console.error("jobService.resendCodes: email failed", {
          jobId: updated.id,
          reference: updated.reference,
          error: sent.error,
        });
        return err(
          "New codes were saved, but the email could not be sent. Try again.",
        );
      }

      await activityService.log({
        type: "JOB_UPDATED",
        entityType: "Job",
        entityId: updated.id,
        entityReference: updated.reference,
        message: "Pickup/dropoff codes resent to customer",
        actorId: actor.id,
      });

      return ok({ job: updated });
    } catch (error) {
      console.error("jobService.resendCodes failed:", error);
      return err("Unable to resend codes.");
    }
  },

  async listInRange(
    rangeStart: Date,
    rangeEnd: Date,
  ): Promise<Result<Job[]>> {
    try {
      const rows = await prisma.job.findMany({
        where: {
          status: { notIn: ["CANCELLED"] },
          OR: [
            {
              scheduledStart: { gte: rangeStart, lt: rangeEnd },
            },
            {
              scheduledEnd: { gt: rangeStart, lte: rangeEnd },
            },
            {
              AND: [
                { scheduledStart: { lte: rangeStart } },
                { scheduledEnd: { gte: rangeEnd } },
              ],
            },
          ],
        },
        orderBy: { scheduledStart: "asc" },
      });

      return ok(rows);
    } catch (error) {
      console.error("jobService.listInRange failed:", error);
      return err("Unable to load calendar jobs.");
    }
  },

  async listForDay(day: Date): Promise<Result<Job[]>> {
    const { start, end } = dayBounds(day);
    return this.listInRange(start, end);
  },

  async countStartingBetween(
    start: Date,
    end: Date,
  ): Promise<Result<number>> {
    try {
      const count = await prisma.job.count({
        where: {
          scheduledStart: { gte: start, lt: end },
          status: { notIn: ["CANCELLED"] },
        },
      });
      return ok(count);
    } catch (error) {
      console.error("jobService.countStartingBetween failed:", error);
      return err("Unable to count jobs.");
    }
  },

  async delete(
    reference: string,
    actor: JobActor,
  ): Promise<Result<{ reference: string }>> {
    try {
      const access = assertCanEditJob(actor);
      if (!access.success) return access;

      const existing = await prisma.job.findUnique({
        where: { reference: reference.trim() },
      });

      if (!existing) {
        return err("Job not found.");
      }

      if (!canDeleteJob(existing.status)) {
        return err("Only completed jobs can be deleted.");
      }

      await prisma.job.delete({ where: { id: existing.id } });

      await activityService.log({
        type: "JOB_UPDATED",
        entityType: "Job",
        entityId: existing.id,
        entityReference: existing.reference,
        message: `Job ${existing.reference} deleted`,
        actorId: actor.id,
        metadata: { deleted: true, status: existing.status },
      });

      return ok({ reference: existing.reference });
    } catch (error) {
      console.error("jobService.delete failed:", error);
      return err("Unable to delete job.");
    }
  },

  async verifyPickup(
    jobId: string,
    code: string,
    actor: JobActor,
  ): Promise<Result<Job>> {
    try {
      const existing = await prisma.job.findUnique({ where: { id: jobId } });
      if (!existing) {
        return err("VERIFICATION_FAILED");
      }

      const access = assertCanTrackJob(existing, actor);
      if (!access.success) return access;

      if (!existing.pickupCodeHash) {
        return err("VERIFICATION_FAILED");
      }
      if (
        existing.pickedUpAt ||
        existing.pickupVerifiedAt
      ) {
        return err("ALREADY_VERIFIED");
      }

      const trimmed = code.trim();
      if (!isSixDigitCode(trimmed)) {
        return err("VERIFICATION_FAILED");
      }

      const matches = await verifyJobCode(trimmed, existing.pickupCodeHash);
      if (!matches) {
        return err("VERIFICATION_FAILED");
      }

      const updated = await prisma.job.update({
        where: { id: existing.id },
        data: {
          pickupVerifiedAt: new Date(),
          status: "IN_PROGRESS",
        },
      });

      await activityService.log({
        type: "JOB_UPDATED",
        entityType: "Job",
        entityId: updated.id,
        entityReference: updated.reference,
        message: "Pickup verified",
        actorId: actor.id,
      });

      await activityService.log({
        type: "JOB_STATUS_CHANGED",
        entityType: "Job",
        entityId: updated.id,
        entityReference: updated.reference,
        message: `Job ${updated.reference} status changed to ${JOB_STATUS_LABELS.IN_PROGRESS}`,
        actorId: actor.id,
        metadata: { from: existing.status, to: "IN_PROGRESS" },
      });

      return ok(updated);
    } catch (error) {
      console.error("jobService.verifyPickup failed:", error);
      return err("VERIFICATION_FAILED");
    }
  },

  async verifyDropoff(
    jobId: string,
    code: string,
    actor: JobActor,
  ): Promise<Result<Job>> {
    try {
      const existing = await prisma.job.findUnique({ where: { id: jobId } });
      if (!existing) {
        return err("VERIFICATION_FAILED");
      }

      const access = assertCanTrackJob(existing, actor);
      if (!access.success) return access;

      if (!existing.dropoffCodeHash) {
        return err("VERIFICATION_FAILED");
      }
      if (!existing.pickedUpAt) {
        return err("PICKUP_REQUIRED");
      }
      if (existing.dropoffVerifiedAt || existing.droppedOffAt) {
        return err("ALREADY_VERIFIED");
      }

      const trimmed = code.trim();
      if (!isSixDigitCode(trimmed)) {
        return err("VERIFICATION_FAILED");
      }

      const matches = await verifyJobCode(trimmed, existing.dropoffCodeHash);
      if (!matches) {
        return err("VERIFICATION_FAILED");
      }

      const updated = await prisma.job.update({
        where: { id: existing.id },
        data: {
          dropoffVerifiedAt: new Date(),
        },
      });

      await activityService.log({
        type: "JOB_UPDATED",
        entityType: "Job",
        entityId: updated.id,
        entityReference: updated.reference,
        message: "Drop-off verified",
        actorId: actor.id,
      });

      return ok(updated);
    } catch (error) {
      console.error("jobService.verifyDropoff failed:", error);
      return err("VERIFICATION_FAILED");
    }
  },

  async addPhotos(
    jobId: string,
    input: {
      type: "PICKUP" | "DROPOFF";
      photos: JobPhotoInput[];
      notes?: string | null;
      finalize?: boolean;
    },
    actor: JobActor,
  ): Promise<Result<Job>> {
    try {
      const existing = await prisma.job.findUnique({ where: { id: jobId } });
      if (!existing) {
        return err("Job not found.");
      }

      const access = assertCanTrackJob(existing, actor);
      if (!access.success) return access;

      if (input.type === "PICKUP" && !existing.pickupVerifiedAt) {
        return err("Pickup must be verified with the customer code before saving.");
      }
      if (input.type === "DROPOFF" && !existing.dropoffVerifiedAt) {
        return err("Drop-off must be verified with the customer code before saving.");
      }

      const finalize = Boolean(input.finalize);
      if (input.photos.length === 0 && !input.notes?.trim() && !finalize) {
        return err("Add at least one photo or a note.");
      }

      const now = new Date();
      const photoRows = input.photos.map((photo) => ({
        url: photo.url,
        publicId: photo.publicId,
        createdAt: now,
      }));

      const data: Prisma.JobUpdateInput = {};
      if (input.type === "PICKUP") {
        if (photoRows.length > 0) {
          data.pickupPhotos = { push: photoRows };
        }
        if (input.notes?.trim()) {
          data.pickupNotes = input.notes.trim();
        }
        if (finalize) {
          data.pickedUpAt = now;
        }
      } else {
        if (photoRows.length > 0) {
          data.dropoffPhotos = { push: photoRows };
        }
        if (input.notes?.trim()) {
          data.dropoffNotes = input.notes.trim();
        }
        if (finalize && existing.pickedUpAt) {
          data.droppedOffAt = now;
          data.actualDurationMinutes = durationMinutes(
            existing.pickedUpAt,
            now,
          );
          data.status = "COMPLETED";
        }
      }

      if (Object.keys(data).length === 0) {
        return ok(existing);
      }

      const updated = await prisma.job.update({
        where: { id: existing.id },
        data,
      });

      if (
        input.type === "DROPOFF" &&
        finalize &&
        updated.status === "COMPLETED" &&
        updated.pickedUpAt &&
        updated.droppedOffAt &&
        updated.actualDurationMinutes != null
      ) {
        if (existing.status !== "COMPLETED") {
          await activityService.log({
            type: "JOB_STATUS_CHANGED",
            entityType: "Job",
            entityId: updated.id,
            entityReference: updated.reference,
            message: `Job ${updated.reference} status changed to ${JOB_STATUS_LABELS.COMPLETED}`,
            actorId: actor.id,
            metadata: { from: existing.status, to: "COMPLETED" },
          });
        }

        const emailTo = updated.contactEmail?.trim() || null;
        if (!emailTo) {
          console.error(
            "jobService.addPhotos: no contactEmail; completion email not sent",
            { jobId: updated.id, reference: updated.reference },
          );
        } else {
          const sent = await sendJobCompletionEmail({
            to: emailTo,
            contactName: updated.contactName,
            jobReference: updated.reference,
            pickedUpAt: updated.pickedUpAt,
            droppedOffAt: updated.droppedOffAt,
            actualDurationMinutes: updated.actualDurationMinutes,
          });
          if (!sent.success) {
            console.error(
              "jobService.addPhotos: completion email failed",
              sent.error,
              { jobId: updated.id, reference: updated.reference },
            );
          }
        }
      }

      const label = input.type === "PICKUP" ? "pickup" : "dropoff";
      await activityService.log({
        type: "JOB_UPDATED",
        entityType: "Job",
        entityId: updated.id,
        entityReference: updated.reference,
        message:
          input.photos.length > 0
            ? `${input.photos.length} ${label} photos uploaded`
            : input.notes?.trim()
              ? `${label} notes saved`
              : `${label} time recorded`,
        actorId: actor.id,
      });

      return ok(updated);
    } catch (error) {
      console.error("jobService.addPhotos failed:", error);
      return err("Unable to save photos.");
    }
  },

  async countDraft(): Promise<Result<number>> {
    try {
      const count = await prisma.job.count({
        where: { status: "DRAFT" },
      });
      return ok(count);
    } catch (error) {
      console.error("jobService.countDraft failed:", error);
      return err("Unable to count draft jobs.");
    }
  },
};
