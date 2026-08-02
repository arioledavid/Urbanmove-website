"use client";

import { useEffect, useId, useRef } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { IconX } from "@tabler/icons-react";
import type { GalleryItem } from "@/lib/video-gallery-data";
import { cn } from "@/lib/utils";

const easeOut = [0.23, 1, 0.32, 1] as const;

type VideoLightboxProps = {
  video: GalleryItem | null;
  onClose: () => void;
  className?: string;
};

export function VideoLightbox({
  video,
  onClose,
  className,
}: VideoLightboxProps) {
  const reduceMotion = useReducedMotion();
  const titleId = useId();
  const videoRef = useRef<HTMLVideoElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const isVideo = Boolean(video?.src);

  useEffect(() => {
    if (!video) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    closeRef.current?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [video, onClose]);

  useEffect(() => {
    if (!video?.src || reduceMotion) return;
    void videoRef.current?.play().catch(() => undefined);
  }, [video, reduceMotion]);

  return (
    <AnimatePresence>
      {video ? (
        <motion.div
          className={cn(
            "fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8",
            className,
          )}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          initial={reduceMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduceMotion ? 0 : 0.2, ease: easeOut }}
        >
          <button
            type="button"
            aria-label="Close"
            className="absolute inset-0 bg-ink/70"
            onClick={onClose}
          />

          <motion.div
            className="relative z-10 w-full max-w-4xl overflow-hidden rounded-lg bg-ink shadow-[0_24px_80px_rgba(0,0,0,0.35)]"
            initial={
              reduceMotion ? false : { opacity: 0, transform: "scale(0.96)" }
            }
            animate={{ opacity: 1, transform: "scale(1)" }}
            exit={{ opacity: 0, transform: "scale(0.97)" }}
            transition={{
              duration: reduceMotion ? 0 : 0.25,
              ease: easeOut,
            }}
          >
            <div className="flex items-center justify-between gap-4 px-4 py-3 sm:px-5">
              <div className="min-w-0">
                <p
                  id={titleId}
                  className="truncate text-sm font-medium text-paper"
                >
                  {video.title}
                </p>
                <p className="truncate text-xs text-paper/70">{video.caption}</p>
              </div>
              <button
                ref={closeRef}
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-paper/10 text-paper transition-[transform,background-color] duration-160 ease-[cubic-bezier(0.23,1,0.32,1)] hover:bg-paper/15 active:scale-[0.97]"
              >
                <IconX size={18} stroke={1.75} />
              </button>
            </div>

            <div className="bg-ink">
              {isVideo ? (
                <div className="flex max-h-[75vh] items-center justify-center">
                  <video
                    ref={videoRef}
                    key={video.id}
                    className="max-h-[75vh] w-full object-contain"
                    src={video.src}
                    poster={video.poster}
                    controls
                    playsInline
                    preload="metadata"
                  >
                    <track kind="captions" />
                  </video>
                </div>
              ) : (
                <div className="flex max-h-[75vh] items-center justify-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={video.poster}
                    alt={video.title}
                    className="max-h-[75vh] w-full object-contain"
                  />
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
