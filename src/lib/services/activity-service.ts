import type { ActivityType, Prisma } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { err, ok, type Result } from "@/lib/result";

export type LogActivityInput = {
  type: ActivityType;
  entityType: string;
  entityId: string;
  entityReference?: string | null;
  message: string;
  metadata?: Prisma.InputJsonValue;
  actorId?: string | null;
};

export const activityService = {
  async log(input: LogActivityInput): Promise<Result<{ id: string }>> {
    try {
      const activity = await prisma.activity.create({
        data: {
          type: input.type,
          entityType: input.entityType,
          entityId: input.entityId,
          entityReference: input.entityReference ?? undefined,
          message: input.message,
          metadata: input.metadata,
          actorId: input.actorId ?? undefined,
        },
        select: { id: true },
      });
      return ok(activity);
    } catch (error) {
      console.error("activityService.log failed:", error);
      return err("Unable to record activity.");
    }
  },

  async listRecent(limit = 8): Promise<
    Result<
      Array<{
        id: string;
        type: ActivityType;
        message: string;
        entityReference: string | null;
        createdAt: Date;
      }>
    >
  > {
    try {
      const rows = await prisma.activity.findMany({
        orderBy: { createdAt: "desc" },
        take: limit,
        select: {
          id: true,
          type: true,
          message: true,
          entityReference: true,
          createdAt: true,
        },
      });
      return ok(rows);
    } catch (error) {
      console.error("activityService.listRecent failed:", error);
      return err("Unable to load activity.");
    }
  },

  async listForEntity(
    entityType: string,
    entityId: string,
    limit = 50,
  ): Promise<
    Result<
      Array<{
        id: string;
        type: ActivityType;
        message: string;
        entityReference: string | null;
        createdAt: Date;
        metadata: Prisma.JsonValue;
      }>
    >
  > {
    try {
      const rows = await prisma.activity.findMany({
        where: { entityType, entityId },
        orderBy: { createdAt: "desc" },
        take: limit,
        select: {
          id: true,
          type: true,
          message: true,
          entityReference: true,
          createdAt: true,
          metadata: true,
        },
      });
      return ok(rows);
    } catch (error) {
      console.error("activityService.listForEntity failed:", error);
      return err("Unable to load activity history.");
    }
  },
};
