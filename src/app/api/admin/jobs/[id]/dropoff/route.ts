import { NextResponse } from "next/server";
import { canAccessJob } from "@/lib/admin-access";
import { requireTrackingSession } from "@/lib/admin-session";
import { jobService } from "@/lib/services/job-service";
import {
  verificationAttemptKey,
  verificationRateLimitService,
} from "@/lib/services/verification-rate-limit-service";

const GENERIC_ERROR = "Unable to verify.";
const RATE_LIMIT_ERROR =
  "Too many attempts. Wait a few minutes and try again.";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(request: Request, context: RouteContext) {
  const actor = await requireTrackingSession();
  if (!actor.success) {
    return NextResponse.json({ error: actor.error }, { status: 401 });
  }

  const { id } = await context.params;
  const jobResult = await jobService.getById(id);
  if (
    !jobResult.success ||
    !canAccessJob(
      actor.data.role,
      actor.data.id,
      jobResult.data.assignedStaffIds,
    )
  ) {
    return NextResponse.json({ error: GENERIC_ERROR }, { status: 400 });
  }

  const rateKey = verificationAttemptKey(id, actor.data.id);
  const rate = await verificationRateLimitService.check(rateKey);
  if (!rate.success) {
    return NextResponse.json({ error: GENERIC_ERROR }, { status: 400 });
  }
  if (!rate.data.allowed) {
    return NextResponse.json({ error: RATE_LIMIT_ERROR }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: GENERIC_ERROR }, { status: 400 });
  }

  const code =
    typeof body === "object" &&
    body !== null &&
    "code" in body &&
    typeof body.code === "string"
      ? body.code
      : "";

  const result = await jobService.verifyDropoff(
    id,
    code,
    { id: actor.data.id, role: actor.data.role },
  );
  if (!result.success) {
    if (result.error === "ALREADY_VERIFIED") {
      return NextResponse.json(
        { error: "Drop-off has already been verified." },
        { status: 409 },
      );
    }
    if (result.error === "PICKUP_REQUIRED") {
      return NextResponse.json(
        { error: "Pickup must be completed first." },
        { status: 400 },
      );
    }
    await verificationRateLimitService.recordFailure(rateKey);
    return NextResponse.json({ error: GENERIC_ERROR }, { status: 400 });
  }

  await verificationRateLimitService.reset(rateKey);

  return NextResponse.json({
    ok: true,
    dropoffVerifiedAt: result.data.dropoffVerifiedAt,
    status: result.data.status,
  });
}
