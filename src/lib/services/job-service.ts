import type { Job, JobStatus, Prisma } from "@prisma/client";
import { dayBounds } from "@/lib/calendar-month";
import { prisma } from "@/lib/db/prisma";
import { isJobTransitionAllowed } from "@/lib/job-workflow";
import {
  isPastOpsDateTime,
  moveDateToScheduledStart,
} from "@/lib/ops-time";
import { err, ok, type Result } from "@/lib/result";
import { activityService } from "@/lib/services/activity-service";
import { referenceService } from "@/lib/services/reference-service";

export type JobWithEnquiry = Job & {
  enquiry: {
    id: string;
    reference: string;
    contactName: string;
    status: string;
    moveDate: Date | null;
  };
};

export type ListJobsInput = {
  status?: JobStatus | "ALL";
  take?: number;
};

export type UpdateJobInput = {
  scheduledStart?: Date | null;
  scheduledEnd?: Date | null;
  status?: JobStatus;
  addressFrom?: string | null;
  addressTo?: string | null;
  notes?: string | null;
  title?: string | null;
};

const JOB_STATUS_LABELS: Record<JobStatus, string> = {
  DRAFT: "Draft",
  SCHEDULED: "Scheduled",
  IN_PROGRESS: "In progress",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

function rangesOverlap(
  aStart: Date,
  aEnd: Date,
  bStart: Date,
  bEnd: Date,
): boolean {
  return aStart < bEnd && bStart < aEnd;
}

/**
 * Jobs created from enquiries default to DRAFT.
 * Scheduling (scheduledStart/End) is done on the job detail page; setting a
 * start date can move status DRAFT → SCHEDULED when staff choose that status.
 */
export const jobService = {
  async createFromEnquiry(
    enquiryId: string,
    actorId?: string | null,
  ): Promise<Result<Job>> {
    try {
      const enquiry = await prisma.enquiry.findUnique({
        where: { id: enquiryId },
      });
      if (!enquiry) {
        return err("Enquiry not found.");
      }
      if (enquiry.status !== "DEPOSIT_PAID") {
        return err(
          "A job can only be created when the enquiry is Deposit Paid.",
        );
      }

      const existing = await prisma.job.findUnique({
        where: { enquiryId: enquiry.id },
      });
      if (existing) {
        return err("A job already exists for this enquiry.");
      }

      const referenceResult = await referenceService.next("job");
      if (!referenceResult.success) return referenceResult;

      const scheduledStart = enquiry.moveDate
        ? moveDateToScheduledStart(enquiry.moveDate, enquiry.serviceType)
        : null;

      const job = await prisma.$transaction(async (tx) => {
        const created = await tx.job.create({
          data: {
            reference: referenceResult.data,
            title: `${enquiry.serviceType} — ${enquiry.contactName}`,
            serviceType: enquiry.serviceType,
            enquiryId: enquiry.id,
            addressFrom: enquiry.fromAddress,
            addressTo: enquiry.toAddress,
            scheduledStart,
            status: "DRAFT",
          },
        });

        await tx.enquiry.update({
          where: { id: enquiry.id },
          data: { status: "JOB_CREATED" },
        });

        return created;
      });

      await activityService.log({
        type: "JOB_CREATED",
        entityType: "Job",
        entityId: job.id,
        entityReference: job.reference,
        message: `Job ${job.reference} created from ${enquiry.reference}`,
        actorId,
        metadata: { enquiryReference: enquiry.reference },
      });

      await activityService.log({
        type: "ENQUIRY_STATUS_CHANGED",
        entityType: "Enquiry",
        entityId: enquiry.id,
        entityReference: enquiry.reference,
        message: `Enquiry ${enquiry.reference} status changed to Job Created`,
        actorId,
        metadata: { from: "DEPOSIT_PAID", to: "JOB_CREATED" },
      });

      return ok(job);
    } catch (error) {
      console.error("jobService.createFromEnquiry failed:", error);
      return err("Unable to create job.");
    }
  },

  async list(input: ListJobsInput = {}): Promise<Result<JobWithEnquiry[]>> {
    try {
      const where: Prisma.JobWhereInput = {};
      if (input.status && input.status !== "ALL") {
        where.status = input.status;
      }

      const rows = await prisma.job.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: input.take ?? 100,
        include: {
          enquiry: {
            select: {
              id: true,
              reference: true,
              contactName: true,
              status: true,
              moveDate: true,
            },
          },
        },
      });

      return ok(rows);
    } catch (error) {
      console.error("jobService.list failed:", error);
      return err("Unable to load jobs.");
    }
  },

  async getByReference(reference: string): Promise<Result<JobWithEnquiry>> {
    try {
      const job = await prisma.job.findUnique({
        where: { reference: reference.trim() },
        include: {
          enquiry: {
            select: {
              id: true,
              reference: true,
              contactName: true,
              status: true,
              moveDate: true,
            },
          },
        },
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
        include: { enquiry: true },
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

      // Keep enquiry lifecycle in sync with job schedule/completion
      if (updated.status === "SCHEDULED" || updated.status === "IN_PROGRESS") {
        if (
          existing.enquiry.status === "JOB_CREATED" ||
          existing.enquiry.status === "SCHEDULED"
        ) {
          await prisma.enquiry.update({
            where: { id: existing.enquiryId },
            data: { status: "SCHEDULED" },
          });
          if (existing.enquiry.status !== "SCHEDULED") {
            await activityService.log({
              type: "ENQUIRY_STATUS_CHANGED",
              entityType: "Enquiry",
              entityId: existing.enquiryId,
              entityReference: existing.enquiry.reference,
              message: `Enquiry ${existing.enquiry.reference} status changed to Scheduled`,
              actorId,
              metadata: { from: existing.enquiry.status, to: "SCHEDULED" },
            });
          }
        }
      }

      if (updated.status === "COMPLETED") {
        await prisma.enquiry.update({
          where: { id: existing.enquiryId },
          data: { status: "COMPLETED" },
        });
        if (existing.enquiry.status !== "COMPLETED") {
          await activityService.log({
            type: "ENQUIRY_STATUS_CHANGED",
            entityType: "Enquiry",
            entityId: existing.enquiryId,
            entityReference: existing.enquiry.reference,
            message: `Enquiry ${existing.enquiry.reference} status changed to Completed`,
            actorId,
            metadata: { from: existing.enquiry.status, to: "COMPLETED" },
          });
        }
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
  ): Promise<Result<JobWithEnquiry[]>> {
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
        include: {
          enquiry: {
            select: {
              id: true,
              reference: true,
              contactName: true,
              status: true,
              moveDate: true,
            },
          },
        },
      });

      return ok(rows);
    } catch (error) {
      console.error("jobService.listInRange failed:", error);
      return err("Unable to load calendar jobs.");
    }
  },

  async listForDay(day: Date): Promise<Result<JobWithEnquiry[]>> {
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
};
