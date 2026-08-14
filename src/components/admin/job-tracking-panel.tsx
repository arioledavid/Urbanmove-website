"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { IconCamera } from "@tabler/icons-react";
import {
  formatAdminDateTime,
  formatDurationMinutes,
} from "@/lib/admin-format";
import { compressImage } from "@/lib/compress-image";

const MAX_FILES = 10;
const THUMB_TRANSFORM = "c_fill,w_400,h_400,q_auto,f_auto";

function cloudinaryThumbUrl(url: string): string {
  const marker = "/upload/";
  const index = url.indexOf(marker);
  if (index === -1) {
    return url;
  }
  const start = index + marker.length;
  const rest = url.slice(start);
  if (rest.startsWith(`${THUMB_TRANSFORM}/`)) {
    return url;
  }
  return `${url.slice(0, start)}${THUMB_TRANSFORM}/${rest}`;
}

export type JobTrackingPhoto = {
  url: string;
  publicId: string;
  createdAt: string;
};

type JobTrackingPanelProps = {
  jobId: string;
  pickupVerifiedAt: string | null;
  pickedUpAt: string | null;
  droppedOffAt: string | null;
  actualDurationMinutes: number | null;
  pickupNotes: string | null;
  dropoffNotes: string | null;
  pickupPhotos: JobTrackingPhoto[];
  dropoffPhotos: JobTrackingPhoto[];
  hasPickupCode: boolean;
  hasDropoffCode: boolean;
  dropoffVerifiedAt: string | null;
};

type Stage = "pickup" | "dropoff";

type LocalPhoto = {
  key: string;
  previewUrl: string;
  status: "compressing" | "uploading" | "done" | "error";
};

type UploadResult =
  | { ok: true; savedPhotos: boolean }
  | { ok: false; error: string };

export function JobTrackingPanel({
  jobId,
  pickupVerifiedAt,
  pickedUpAt,
  droppedOffAt,
  actualDurationMinutes,
  pickupNotes,
  dropoffNotes,
  pickupPhotos,
  dropoffPhotos,
  hasPickupCode,
  hasDropoffCode,
  dropoffVerifiedAt,
}: JobTrackingPanelProps) {
  const bothDone = Boolean(pickedUpAt && droppedOffAt);
  const dropoffUnlocked = Boolean(
    hasDropoffCode || dropoffVerifiedAt,
  );

  return (
    <section className="rounded-lg border border-border bg-paper p-4 sm:p-5">
      <h2 className="text-sm font-semibold text-ink">Job tracking</h2>

      {!hasPickupCode && !pickedUpAt ? (
        <p className="mt-3 text-sm text-muted">
          Record pickup becomes available after this job is set to{" "}
          <span className="font-medium text-ink">Scheduled</span>.
        </p>
      ) : null}

      {bothDone ? (
        <TrackingSummary
          pickedUpAt={pickedUpAt!}
          droppedOffAt={droppedOffAt!}
          actualDurationMinutes={actualDurationMinutes}
          pickupNotes={pickupNotes}
          dropoffNotes={dropoffNotes}
          pickupPhotos={pickupPhotos}
          dropoffPhotos={dropoffPhotos}
        />
      ) : hasPickupCode || pickedUpAt ? (
        <div className="mt-4 space-y-4">
          {pickedUpAt ? (
            <StageSummary
              label="Pickup"
              at={pickedUpAt}
              notes={pickupNotes}
              photos={pickupPhotos}
            />
          ) : (
            <VerifyAndPhotos
              jobId={jobId}
              stage="pickup"
              verifyPath={`/api/admin/jobs/${jobId}/pickup`}
              verifyLabel="Verify Pickup"
              actionLabel="Record pickup"
              saveLabel="Confirm pickup"
              initiallyVerified={Boolean(pickupVerifiedAt)}
            />
          )}

          {pickedUpAt && !droppedOffAt && dropoffUnlocked ? (
            <VerifyAndPhotos
              jobId={jobId}
              stage="dropoff"
              verifyPath={`/api/admin/jobs/${jobId}/dropoff`}
              verifyLabel="Verify Drop-off"
              actionLabel="Record drop-off"
              saveLabel="Confirm drop-off"
              initiallyVerified={Boolean(dropoffVerifiedAt)}
            />
          ) : null}
        </div>
      ) : null}
    </section>
  );
}

function VerifyAndPhotos({
  jobId,
  stage,
  verifyPath,
  verifyLabel,
  actionLabel,
  saveLabel,
  initiallyVerified = false,
}: {
  jobId: string;
  stage: Stage;
  verifyPath: string;
  verifyLabel: string;
  actionLabel: string;
  saveLabel: string;
  initiallyVerified?: boolean;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(initiallyVerified);
  const [code, setCode] = useState("");
  const [verified, setVerified] = useState(initiallyVerified);
  const [notes, setNotes] = useState("");
  const [photos, setPhotos] = useState<LocalPhoto[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const uploadGenerationRef = useRef(0);
  const uploadPromiseRef = useRef<Promise<UploadResult> | null>(null);
  const previewUrlsRef = useRef<string[]>([]);
  const needsFinalizeRef = useRef(false);

  useEffect(() => {
    return () => {
      for (const url of previewUrlsRef.current) {
        URL.revokeObjectURL(url);
      }
    };
  }, []);

  useEffect(() => {
    needsFinalizeRef.current = verified;
  }, [verified]);

  useEffect(() => {
    if (!verified) return;

    function onBeforeUnload(event: BeforeUnloadEvent) {
      if (!needsFinalizeRef.current) return;
      event.preventDefault();
      event.returnValue = "";
    }

    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [verified]);

  function revokePreviews() {
    for (const url of previewUrlsRef.current) {
      URL.revokeObjectURL(url);
    }
    previewUrlsRef.current = [];
  }

  async function postEvidence(input: {
    files?: File[];
    notes?: string;
    finalize?: boolean;
  }): Promise<{ ok: true } | { ok: false; error: string }> {
    const formData = new FormData();
    formData.set("type", stage === "pickup" ? "PICKUP" : "DROPOFF");
    if (input.notes?.trim()) {
      formData.set("notes", input.notes.trim());
    }
    if (input.finalize) {
      formData.set("finalize", "true");
    }
    for (const file of input.files ?? []) {
      formData.append("photos", file);
    }

    try {
      const response = await fetch(`/api/admin/jobs/${jobId}/photos`, {
        method: "POST",
        body: formData,
      });
      const payload = (await response.json().catch(() => null)) as {
        error?: string;
      } | null;

      if (!response.ok) {
        return {
          ok: false,
          error: payload?.error || "Unable to save photos.",
        };
      }

      return { ok: true };
    } catch {
      return {
        ok: false,
        error: "Unable to save. Check your connection and try again.",
      };
    }
  }

  function handleFiles(fileList: FileList | null) {
    if (!verified) {
      return;
    }
    setError(null);

    if (!fileList?.length) {
      uploadGenerationRef.current += 1;
      uploadPromiseRef.current = null;
      revokePreviews();
      setPhotos([]);
      return;
    }

    const files = Array.from(fileList).slice(0, MAX_FILES);
    const generation = ++uploadGenerationRef.current;

    revokePreviews();
    const nextPhotos: LocalPhoto[] = files.map((file, index) => {
      const previewUrl = URL.createObjectURL(file);
      previewUrlsRef.current.push(previewUrl);
      return {
        key: `${file.name}-${file.size}-${file.lastModified}-${index}`,
        previewUrl,
        status: "compressing",
      };
    });
    setPhotos(nextPhotos);

    const promise = (async (): Promise<UploadResult> => {
      try {
        const compressed: File[] = new Array(files.length);
        await Promise.all(
          files.map(async (file, index) => {
            compressed[index] = await compressImage(file);
            if (generation !== uploadGenerationRef.current) {
              return;
            }
            setPhotos((current) =>
              current.map((photo, photoIndex) =>
                photoIndex === index
                  ? { ...photo, status: "uploading" }
                  : photo,
              ),
            );
          }),
        );

        if (generation !== uploadGenerationRef.current) {
          return { ok: true, savedPhotos: false };
        }

        const result = await postEvidence({ files: compressed });
        if (generation !== uploadGenerationRef.current) {
          return { ok: true, savedPhotos: false };
        }

        if (!result.ok) {
          setPhotos((current) =>
            current.map((photo) => ({ ...photo, status: "error" })),
          );
          setError(result.error);
          return { ok: false, error: result.error };
        }

        setPhotos((current) =>
          current.map((photo) => ({ ...photo, status: "done" })),
        );
        return { ok: true, savedPhotos: true };
      } catch {
        if (generation !== uploadGenerationRef.current) {
          return { ok: true, savedPhotos: false };
        }
        const message = "Unable to save. Check your connection and try again.";
        setPhotos((current) =>
          current.map((photo) => ({ ...photo, status: "error" })),
        );
        setError(message);
        return { ok: false, error: message };
      }
    })();

    uploadPromiseRef.current = promise;
  }

  async function verify() {
    setError(null);
    setPending(true);
    try {
      const response = await fetch(verifyPath, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const payload = (await response.json().catch(() => null)) as {
        error?: string;
      } | null;

      if (!response.ok) {
        setError(payload?.error || "Unable to verify.");
        return;
      }

      setVerified(true);
      setCode("");
    } catch {
      setError("Unable to verify. Check your connection and try again.");
    } finally {
      setPending(false);
    }
  }

  async function saveEvidence() {
    if (!verified) {
      setError("Enter and verify the customer code before saving.");
      return;
    }
    setError(null);
    setPending(true);
    try {
      if (uploadPromiseRef.current) {
        const uploadResult = await uploadPromiseRef.current;
        if (!uploadResult.ok) {
          setError(uploadResult.error);
          return;
        }
      }

      const trimmedNotes = notes.trim();
      const saveResult = await postEvidence({
        notes: trimmedNotes || undefined,
        finalize: true,
      });
      if (!saveResult.ok) {
        setError(saveResult.error);
        return;
      }

      needsFinalizeRef.current = false;
      router.refresh();
    } catch {
      setError("Unable to save. Check your connection and try again.");
    } finally {
      setPending(false);
    }
  }

  const compressingCount = photos.filter(
    (photo) => photo.status === "compressing",
  ).length;
  const uploadingCount = photos.filter(
    (photo) => photo.status === "uploading",
  ).length;
  const isBusy = compressingCount > 0 || uploadingCount > 0;

  let saveButtonLabel = saveLabel;
  if (compressingCount > 0) {
    saveButtonLabel = `Preparing ${photos.length - compressingCount}/${photos.length}…`;
  } else if (uploadingCount > 0) {
    saveButtonLabel =
      photos.length === 1
        ? "Uploading…"
        : `Uploading ${photos.length} photos…`;
  } else if (pending) {
    saveButtonLabel = "Saving…";
  }

  if (!open && !verified) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex min-h-14 w-full items-center justify-center gap-2 rounded-md bg-primary px-4 text-base font-semibold text-paper transition-transform duration-150 ease-out active:scale-[0.98] [@media(hover:hover)_and_(pointer:fine)]:hover:bg-primary-hover"
      >
        {actionLabel}
      </button>
    );
  }

  if (!verified) {
    return (
      <div className="space-y-3 rounded-md border border-border bg-surface p-3 sm:p-4">
        <label
          htmlFor={`${stage}-code`}
          className="block text-sm font-medium text-ink"
        >
          6-digit customer code
        </label>
        <input
          id={`${stage}-code`}
          inputMode="numeric"
          autoComplete="one-time-code"
          pattern="\d{6}"
          maxLength={6}
          value={code}
          onChange={(event) =>
            setCode(event.target.value.replace(/\D/g, "").slice(0, 6))
          }
          className="h-14 w-full rounded-md border border-border bg-paper px-3 text-center text-2xl font-semibold tracking-[0.35em] text-ink tabular-nums outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          placeholder="000000"
        />
        {error ? (
          <p className="text-sm text-primary" role="alert">
            {error}
          </p>
        ) : null}
        <div className="flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            onClick={verify}
            disabled={pending || code.length !== 6}
            className="inline-flex min-h-12 flex-1 items-center justify-center rounded-md bg-ink px-4 text-sm font-semibold text-paper transition-transform duration-150 ease-out active:scale-[0.98] disabled:opacity-60 [@media(hover:hover)_and_(pointer:fine)]:hover:bg-secondary-hover"
          >
            {pending ? "Verifying…" : verifyLabel}
          </button>
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              setCode("");
              setError(null);
            }}
            disabled={pending}
            className="inline-flex min-h-12 items-center justify-center rounded-md border border-border px-4 text-sm font-medium text-ink active:scale-[0.98] disabled:opacity-60 [@media(hover:hover)_and_(pointer:fine)]:hover:bg-paper"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3 rounded-md border border-border bg-surface p-3 sm:p-4">
      <p className="text-sm font-medium text-ink">
        Code verified. Add optional photos or notes, then confirm to record the
        time.
      </p>
      <label
        htmlFor={`${stage}-photos`}
        className="block text-sm font-medium text-ink"
      >
        Photos{" "}
        <span className="font-normal text-subtle">(optional)</span>
      </label>
      <input
        id={`${stage}-photos`}
        type="file"
        accept="image/*"
        multiple
        disabled={isBusy}
        onChange={(event) => handleFiles(event.target.files)}
        className="block w-full text-sm text-ink file:mr-3 file:inline-flex file:min-h-11 file:rounded-md file:border-0 file:bg-ink file:px-3 file:text-sm file:font-medium file:text-paper disabled:opacity-60"
      />
      <p className="text-xs text-muted">
        Photos are optional. On a phone, this can open the camera or your photo
        library. Selected photos upload immediately.
      </p>
      {photos.length > 0 ? (
        <ul className="grid grid-cols-4 gap-2">
          {photos.map((photo) => (
            <li
              key={photo.key}
              className="relative overflow-hidden rounded-md border border-border"
            >
              {/* Local object URLs; native img avoids next/image for blob: previews. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photo.previewUrl}
                alt=""
                className="aspect-square h-full w-full object-cover"
              />
              {photo.status !== "done" ? (
                <span className="absolute inset-x-0 bottom-0 bg-ink/70 px-1 py-0.5 text-center text-[10px] font-medium text-paper">
                  {photo.status === "compressing"
                    ? "Preparing…"
                    : photo.status === "error"
                      ? "Failed"
                      : "Uploading…"}
                </span>
              ) : null}
            </li>
          ))}
        </ul>
      ) : null}
      <label
        htmlFor={`${stage}-notes`}
        className="block text-sm font-medium text-ink"
      >
        Notes{" "}
        <span className="font-normal text-subtle">(optional)</span>
      </label>
      <textarea
        id={`${stage}-notes`}
        rows={3}
        value={notes}
        onChange={(event) => setNotes(event.target.value)}
        className="w-full rounded-md border border-border bg-paper px-3 py-2 text-sm text-ink outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
      />
      {error ? (
        <p className="text-sm text-primary" role="alert">
          {error}
        </p>
      ) : null}
      <button
        type="button"
        onClick={saveEvidence}
        disabled={pending || isBusy}
        className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-semibold text-paper transition-transform duration-150 ease-out active:scale-[0.98] disabled:opacity-60 [@media(hover:hover)_and_(pointer:fine)]:hover:bg-primary-hover"
      >
        <IconCamera className="h-4 w-4" aria-hidden />
        {saveButtonLabel}
      </button>
      <p className="text-xs text-muted text-pretty">
        Confirm records the {stage === "pickup" ? "pickup" : "drop-off"} time.
        Leave without confirming and the time will not be saved.
      </p>
    </div>
  );
}

function StageSummary({
  label,
  at,
  notes,
  photos,
}: {
  label: string;
  at: string;
  notes: string | null;
  photos: JobTrackingPhoto[];
}) {
  return (
    <div className="rounded-md border border-border bg-surface p-3">
      <p className="text-xs font-medium text-muted">{label}</p>
      <p className="mt-1 text-sm font-medium text-ink">
        {formatAdminDateTime(at)}
      </p>
      {notes ? (
        <p className="mt-2 whitespace-pre-wrap text-sm text-ink">{notes}</p>
      ) : null}
      <PhotoStrip photos={photos} />
    </div>
  );
}

function TrackingSummary({
  pickedUpAt,
  droppedOffAt,
  actualDurationMinutes,
  pickupNotes,
  dropoffNotes,
  pickupPhotos,
  dropoffPhotos,
}: {
  pickedUpAt: string;
  droppedOffAt: string;
  actualDurationMinutes: number | null;
  pickupNotes: string | null;
  dropoffNotes: string | null;
  pickupPhotos: JobTrackingPhoto[];
  dropoffPhotos: JobTrackingPhoto[];
}) {
  return (
    <div className="mt-4 space-y-4">
      <dl className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <div>
          <dt className="text-xs font-medium text-muted">Pickup</dt>
          <dd className="mt-1 text-sm text-ink">
            {formatAdminDateTime(pickedUpAt)}
          </dd>
        </div>
        <div>
          <dt className="text-xs font-medium text-muted">Drop-off</dt>
          <dd className="mt-1 text-sm text-ink">
            {formatAdminDateTime(droppedOffAt)}
          </dd>
        </div>
        <div className="col-span-2 sm:col-span-1">
          <dt className="text-xs font-medium text-muted">Actual duration</dt>
          <dd className="mt-1 text-sm font-medium text-ink tabular-nums">
            {formatDurationMinutes(actualDurationMinutes)}
          </dd>
        </div>
      </dl>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <p className="text-xs font-medium text-muted">Pickup photos</p>
          <PhotoStrip photos={pickupPhotos} />
          {pickupNotes ? (
            <p className="mt-2 whitespace-pre-wrap text-sm text-ink">
              {pickupNotes}
            </p>
          ) : null}
        </div>
        <div>
          <p className="text-xs font-medium text-muted">Drop-off photos</p>
          <PhotoStrip photos={dropoffPhotos} />
          {dropoffNotes ? (
            <p className="mt-2 whitespace-pre-wrap text-sm text-ink">
              {dropoffNotes}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function PhotoStrip({ photos }: { photos: JobTrackingPhoto[] }) {
  if (photos.length === 0) {
    return <p className="mt-2 text-sm text-muted">No photos yet.</p>;
  }

  return (
    <ul className="mt-2 grid grid-cols-4 gap-2">
      {photos.map((photo) => (
        <li key={photo.publicId}>
          <a
            href={photo.url}
            target="_blank"
            rel="noreferrer"
            className="block overflow-hidden rounded-md border border-border"
          >
            {/* Cloudinary URLs are remote; native img avoids next/image config coupling in this MVP. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={cloudinaryThumbUrl(photo.url)}
              alt=""
              className="aspect-square h-full w-full object-cover"
            />
          </a>
        </li>
      ))}
    </ul>
  );
}
