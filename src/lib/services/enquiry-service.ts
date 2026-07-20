import type { Enquiry, EnquiryStatus, Prisma, ServiceType } from "@prisma/client";
import {
  ENQUIRY_CONVERTED_STATUSES,
  ENQUIRY_LIST_STATUSES,
  ENQUIRY_STATUS_LABELS,
  isEnquiryTransitionAllowed,
} from "@/lib/enquiry-workflow";
import { prisma } from "@/lib/db/prisma";
import { err, ok, type Result } from "@/lib/result";
import { activityService } from "@/lib/services/activity-service";
import { referenceService } from "@/lib/services/reference-service";

export type CreateEnquiryInput = {
  serviceType: ServiceType;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  fromAddress?: string | null;
  toAddress?: string | null;
  postcodeFrom?: string | null;
  postcodeTo?: string | null;
  moveDate?: Date | null;
  propertyType?: string | null;
  payload: Prisma.InputJsonValue;
  source?: string;
  actorId?: string | null;
};

export type ListEnquiriesInput = {
  status?: EnquiryStatus | "ALL";
  q?: string;
  take?: number;
};

export type EnquiryWithJob = Enquiry & {
  job: { id: string; reference: string; status: string } | null;
};

export const enquiryService = {
  async create(input: CreateEnquiryInput): Promise<Result<Enquiry>> {
    try {
      if (!input.contactName.trim()) {
        return err("Contact name is required.");
      }
      if (!input.contactEmail.trim()) {
        return err("Contact email is required.");
      }
      if (!input.contactPhone.trim()) {
        return err("Contact phone is required.");
      }

      const referenceResult = await referenceService.next("enquiry");
      if (!referenceResult.success) return referenceResult;

      const enquiry = await prisma.enquiry.create({
        data: {
          reference: referenceResult.data,
          status: "NEW",
          serviceType: input.serviceType,
          contactName: input.contactName.trim(),
          contactEmail: input.contactEmail.trim().toLowerCase(),
          contactPhone: input.contactPhone.trim(),
          fromAddress: input.fromAddress?.trim() || null,
          toAddress: input.toAddress?.trim() || null,
          postcodeFrom: input.postcodeFrom?.trim() || null,
          postcodeTo: input.postcodeTo?.trim() || null,
          moveDate: input.moveDate ?? null,
          propertyType: input.propertyType?.trim() || null,
          payload: input.payload,
          source: input.source ?? "website",
        },
      });

      await activityService.log({
        type: "ENQUIRY_CREATED",
        entityType: "Enquiry",
        entityId: enquiry.id,
        entityReference: enquiry.reference,
        message: `Enquiry ${enquiry.reference} created`,
        actorId: input.actorId,
      });

      return ok(enquiry);
    } catch (error) {
      console.error("enquiryService.create failed:", error);
      return err("Unable to create enquiry.");
    }
  },

  async list(input: ListEnquiriesInput = {}): Promise<Result<EnquiryWithJob[]>> {
    try {
      const q = input.q?.trim();
      const where: Prisma.EnquiryWhereInput = {};

      // Converted enquiries stay in the DB for reports/counts, but leave the
      // Enquiries inbox — work continues under Jobs.
      if (input.status && input.status !== "ALL") {
        if (
          !(ENQUIRY_LIST_STATUSES as EnquiryStatus[]).includes(input.status)
        ) {
          return ok([]);
        }
        where.status = input.status;
      } else {
        where.status = { notIn: ENQUIRY_CONVERTED_STATUSES };
      }

      if (q) {
        where.OR = [
          { reference: { contains: q } },
          { contactName: { contains: q } },
          { contactEmail: { contains: q } },
          { fromAddress: { contains: q } },
          { toAddress: { contains: q } },
          { postcodeFrom: { contains: q } },
          { postcodeTo: { contains: q } },
        ];
      }

      const rows = await prisma.enquiry.findMany({
        where,
        orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
        take: input.take ?? 100,
        include: {
          job: { select: { id: true, reference: true, status: true } },
        },
      });

      return ok(rows);
    } catch (error) {
      console.error("enquiryService.list failed:", error);
      return err("Unable to load enquiries.");
    }
  },

  async getByReference(reference: string): Promise<Result<EnquiryWithJob>> {
    try {
      const enquiry = await prisma.enquiry.findUnique({
        where: { reference: reference.trim() },
        include: {
          job: { select: { id: true, reference: true, status: true } },
        },
      });

      if (!enquiry) {
        return err("Enquiry not found.");
      }

      return ok(enquiry);
    } catch (error) {
      console.error("enquiryService.getByReference failed:", error);
      return err("Unable to load enquiry.");
    }
  },

  async updateStatus(
    reference: string,
    newStatus: EnquiryStatus,
    actorId?: string | null,
  ): Promise<Result<Enquiry>> {
    try {
      const enquiry = await prisma.enquiry.findUnique({
        where: { reference: reference.trim() },
      });

      if (!enquiry) {
        return err("Enquiry not found.");
      }

      if (enquiry.status === newStatus) {
        return ok(enquiry);
      }

      if (!isEnquiryTransitionAllowed(enquiry.status, newStatus)) {
        return err(
          `Cannot change status from ${ENQUIRY_STATUS_LABELS[enquiry.status]} to ${ENQUIRY_STATUS_LABELS[newStatus]}.`,
        );
      }

      const updated = await prisma.enquiry.update({
        where: { id: enquiry.id },
        data: { status: newStatus },
      });

      await activityService.log({
        type: "ENQUIRY_STATUS_CHANGED",
        entityType: "Enquiry",
        entityId: enquiry.id,
        entityReference: enquiry.reference,
        message: `Enquiry ${enquiry.reference} status changed to ${ENQUIRY_STATUS_LABELS[newStatus]}`,
        actorId,
        metadata: { from: enquiry.status, to: newStatus },
      });

      return ok(updated);
    } catch (error) {
      console.error("enquiryService.updateStatus failed:", error);
      return err("Unable to update enquiry status.");
    }
  },

  async countByStatus(status: EnquiryStatus): Promise<Result<number>> {
    try {
      const count = await prisma.enquiry.count({ where: { status } });
      return ok(count);
    } catch (error) {
      console.error("enquiryService.countByStatus failed:", error);
      return err("Unable to count enquiries.");
    }
  },

  async countCreatedSince(since: Date): Promise<Result<number>> {
    try {
      const count = await prisma.enquiry.count({
        where: { createdAt: { gte: since } },
      });
      return ok(count);
    } catch (error) {
      console.error("enquiryService.countCreatedSince failed:", error);
      return err("Unable to count enquiries.");
    }
  },
};
