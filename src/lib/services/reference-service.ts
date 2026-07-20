import { prisma } from "@/lib/db/prisma";
import { err, ok, type Result } from "@/lib/result";

export type ReferenceKind = "enquiry" | "job" | "customer";

function utcDateKey(date = new Date()): string {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  const d = String(date.getUTCDate()).padStart(2, "0");
  return `${y}${m}${d}`;
}

function counterId(kind: ReferenceKind, date = new Date()): string {
  if (kind === "customer") return "customer";
  return `${kind}:${utcDateKey(date)}`;
}

function formatReference(kind: ReferenceKind, seq: number, date = new Date()): string {
  if (kind === "customer") {
    return `CUS-${String(seq).padStart(5, "0")}`;
  }
  const prefix = kind === "enquiry" ? "ENQ" : "JOB";
  return `${prefix}-${utcDateKey(date)}-${String(seq).padStart(4, "0")}`;
}

type FindAndModifyResult = {
  value?: { _id?: string; seq?: number } | null;
};

async function nextSequence(kind: ReferenceKind): Promise<Result<number>> {
  const id = counterId(kind);

  try {
    const result = (await prisma.$runCommandRaw({
      findAndModify: "counters",
      query: { _id: id },
      update: { $inc: { seq: 1 } },
      upsert: true,
      new: true,
    })) as FindAndModifyResult;

    const seq = result.value?.seq;
    if (typeof seq !== "number" || seq < 1) {
      return err("Unable to allocate reference number.");
    }

    return ok(seq);
  } catch (error) {
    console.error("referenceService.nextSequence failed:", error);
    return err("Unable to allocate reference number.");
  }
}

export const referenceService = {
  async next(kind: ReferenceKind): Promise<Result<string>> {
    const seqResult = await nextSequence(kind);
    if (!seqResult.success) return seqResult;
    return ok(formatReference(kind, seqResult.data));
  },
};
