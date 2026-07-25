import type { Job, JobStatus, Prisma, ServiceType } from "@prisma/client";
import { dayBounds } from "@/lib/calendar-month";
import { prisma } from "@/lib/db/prisma";
import { canDeleteJob, isJobTransitionAllowed } from "@/lib/job-workflow";
import { isPastOpsDateTime } from "@/lib/ops-time";
import { err, ok, type Result } from "@/lib/result";
import { activityService } from "@/lib/services/activity-service";
import { referenceService } from "@/lib/services/reference-service";

export type ListJobsInput = {
  status?: JobStatus | "ALL";
  take?: number;
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

/**
 * Jobs are created manually (from converted email leads) as DRAFT.
 * Name, service, and scheduled start are required at creation; other fields are optional.
 */
export const jobService = {
  async create(
    input: CreateJobInput,
    actorId?: string | null,
  ): Promise<Result<Job>> {
    try {
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
        `${input.serviceType} — ${contactName}`;

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
        },
      });

      await activityService.log({
        type: "JOB_CREATED",
        entityType: "Job",
        entityId: job.id,
        entityReference: job.reference,
        message: `Job ${job.reference} created`,
        actorId,
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
    actorId?: string | null,
  ): Promise<Result<{ job: Job; overlapWarnings: string[] }>> {
    try {
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
          actorId,
          metadata: { from: existing.status, to: updated.status },
        });
      } else {
        await activityService.log({
          type: "JOB_UPDATED",
          entityType: "Job",
          entityId: updated.id,
          entityReference: updated.reference,
          message: `Job ${updated.reference} updated`,
          actorId,
        });
      }

      return ok({ job: updated, overlapWarnings });
    } catch (error) {
      console.error("jobService.update failed:", error);
      return err("Unable to update job.");
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
    actorId?: string | null,
  ): Promise<Result<{ reference: string }>> {
    try {
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
        actorId,
        metadata: { deleted: true, status: existing.status },
      });

      return ok({ reference: existing.reference });
    } catch (error) {
      console.error("jobService.delete failed:", error);
      return err("Unable to delete job.");
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
