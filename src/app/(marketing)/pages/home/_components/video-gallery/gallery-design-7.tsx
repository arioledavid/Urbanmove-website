"use client";

import { useCallback, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  IconChevronLeft,
  IconChevronRight,
  IconPlayerPlay,
} from "@tabler/icons-react";
import {
  GALLERY_VIDEOS,
  type GalleryItem,
} from "@/lib/video-gallery-data";
import { cn } from "@/lib/utils";
import { VideoLightbox } from "./video-lightbox";

/** Mobile: full-width carousel with arrows and dot indicators. */
const EASE = [0.23, 1, 0.32, 1] as const;

export function GalleryDesign7() {
  const reduceMotion = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [active, setActive] = useState<GalleryItem | null>(null);

  const item = GALLERY_VIDEOS[index];
  const total = GALLERY_VIDEOS.length;
  const isVideo = Boolean(item?.src);

  const go = useCallback(
    (direction: -1 | 1) => {
      setIndex((prev) => (prev + direction + total) % total);
    },
    [total],
  );

  if (!item) return null;

  return (
    <div>
      <div className="relative overflow-hidden rounded-lg bg-ink">
        <AnimatePresence mode="wait">
          <motion.button
            key={item.id}
            type="button"
            onClick={() => setActive(item)}
            aria-label={isVideo ? `Play ${item.title}` : `View ${item.title}`}
            className="group relative block aspect-[16/10] w-full"
            initial={reduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={reduceMotion ? undefined : { opacity: 0 }}
            transition={{ duration: 0.25, ease: EASE }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={item.poster}
              alt=""
              className="h-full w-full object-cover"
              loading="lazy"
              decoding="async"
            />
            <span className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/20 to-transparent" />
            {isVideo ? (
              <span className="absolute inset-0 flex items-center justify-center">
                <span className="inline-flex size-14 items-center justify-center rounded-full bg-primary text-paper">
                  <IconPlayerPlay size={24} stroke={1.5} fill="currentColor" />
                </span>
              </span>
            ) : null}
            <span className="absolute right-4 bottom-4 left-4 text-left">
              <span className="text-xl font-semibold tracking-[-0.02em] text-paper">
                {item.title}
              </span>
              <span className="mt-1 block text-sm text-paper/75">
                {item.caption}
              </span>
            </span>
          </motion.button>
        </AnimatePresence>

        <div className="flex items-center justify-between gap-4 border-t border-paper/10 px-4 py-3">
          <div className="flex gap-2">
            <button
              type="button"
              aria-label="Previous"
              onClick={() => go(-1)}
              className="inline-flex size-9 items-center justify-center rounded-full bg-paper/10 text-paper transition-transform duration-160 ease-[cubic-bezier(0.23,1,0.32,1)] active:scale-[0.97]"
            >
              <IconChevronLeft size={18} stroke={1.75} />
            </button>
            <button
              type="button"
              aria-label="Next"
              onClick={() => go(1)}
              className="inline-flex size-9 items-center justify-center rounded-full bg-paper/10 text-paper transition-transform duration-160 ease-[cubic-bezier(0.23,1,0.32,1)] active:scale-[0.97]"
            >
              <IconChevronRight size={18} stroke={1.75} />
            </button>
          </div>

          <div className="flex items-center gap-2">
            {GALLERY_VIDEOS.map((galleryItem, i) => (
              <button
                key={galleryItem.id}
                type="button"
                aria-label={`Go to ${galleryItem.title}`}
                onClick={() => setIndex(i)}
                className={cn(
                  "h-1.5 rounded-full transition-[width,background-color] duration-200",
                  i === index ? "w-6 bg-primary" : "w-1.5 bg-paper/35",
                )}
              />
            ))}
          </div>

          <span className="text-xs text-paper/50 tabular-nums">
            {String(index + 1).padStart(2, "0")} /{" "}
            {String(total).padStart(2, "0")}
          </span>
        </div>
      </div>

      <VideoLightbox video={active} onClose={() => setActive(null)} />
    </div>
  );
}
