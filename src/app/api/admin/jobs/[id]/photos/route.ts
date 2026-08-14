import { NextResponse } from "next/server";
import { canTrackJob } from "@/lib/admin-access";
import { requireTrackingSession } from "@/lib/admin-session";
import { uploadImageBuffer } from "@/lib/cloudinary";
import { jobService } from "@/lib/services/job-service";

const MAX_FILES = 10;
const MAX_FILE_BYTES = 10 * 1024 * 1024;

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
  if (!jobResult.success) {
    return NextResponse.json({ error: "Job not found." }, { status: 404 });
  }
  if (
    !canTrackJob(
      actor.data.role,
      actor.data.id,
      jobResult.data.assignedStaffIds,
    )
  ) {
    return NextResponse.json({ error: "You do not have access." }, { status: 403 });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data." }, { status: 400 });
  }

  const typeRaw = String(formData.get("type") ?? "").toUpperCase();
  if (typeRaw !== "PICKUP" && typeRaw !== "DROPOFF") {
    return NextResponse.json({ error: "Invalid photo type." }, { status: 400 });
  }
  const type = typeRaw as "PICKUP" | "DROPOFF";

  const notesValue = formData.get("notes");
  const notes =
    typeof notesValue === "string" && notesValue.trim()
      ? notesValue.trim()
      : null;
  const finalize = String(formData.get("finalize") ?? "") === "true";

  const files = formData
    .getAll("photos")
    .filter((entry): entry is File => entry instanceof File && entry.size > 0);

  if (files.length > MAX_FILES) {
    return NextResponse.json(
      { error: `You can upload at most ${MAX_FILES} photos at a time.` },
      { status: 400 },
    );
  }

  for (const file of files) {
    if (file.size > MAX_FILE_BYTES) {
      return NextResponse.json(
        { error: "Each photo must be 10MB or smaller." },
        { status: 400 },
      );
    }
    if (file.type && !file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "Only image files can be uploaded." },
        { status: 400 },
      );
    }
  }

  let uploaded: Array<{ url: string; publicId: string }> = [];

  if (files.length > 0) {
    try {
      uploaded = await Promise.all(
        files.map(async (file) => {
          const buffer = Buffer.from(await file.arrayBuffer());
          return uploadImageBuffer(buffer, file.name);
        }),
      );
    } catch (error) {
      console.error("Cloudinary job photo upload failed:", error);
      return NextResponse.json(
        { error: "Unable to upload photos. Check Cloudinary credentials." },
        { status: 502 },
      );
    }
  }

  const result = await jobService.addPhotos(
    id,
    { type, photos: uploaded, notes, finalize },
    actor.data,
  );

  if (!result.success) {
    const status =
      result.error.includes("verified") ? 400 : 500;
    return NextResponse.json({ error: result.error }, { status });
  }

  return NextResponse.json({
    ok: true,
    pickupPhotos: result.data.pickupPhotos,
    dropoffPhotos: result.data.dropoffPhotos,
    pickupNotes: result.data.pickupNotes,
    dropoffNotes: result.data.dropoffNotes,
    pickedUpAt: result.data.pickedUpAt,
    droppedOffAt: result.data.droppedOffAt,
    actualDurationMinutes: result.data.actualDurationMinutes,
  });
}
