"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { IconPlayerPlay } from "@tabler/icons-react";
import {
  GALLERY_VIDEOS,
  type GalleryItem,
} from "@/lib/video-gallery-data";
import { cn } from "@/lib/utils";
import { VideoLightbox } from "./video-lightbox";

/** Desktop: equal-row bento so side tiles share height with no leftover gap. */
const EASE = [0.16, 1, 0.3, 1] as const;

const TILE_CLASS: Record<number, string> = {
  0: "aspect-[4/3] md:col-span-2 md:row-span-2 md:aspect-auto md:h-full",
  1: "aspect-[4/3] md:aspect-auto md:h-full",
  2: "aspect-[4/3] md:aspect-auto md:h-full",
  3: "aspect-[4/3] md:aspect-auto md:h-full",
  4: "aspect-[4/3] md:aspect-auto md:h-full",
  5: "aspect-[4/3] md:col-span-4 md:aspect-auto md:h-full",
};

export function GalleryDesign6() {
  const reduceMotion = useReducedMotion();
  const [active, setActive] = useState<GalleryItem | null>(null);

  return (
    <div>
      <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:h-[min(70vh,640px)] md:grid-cols-4 md:grid-rows-3 md:gap-2">
        {GALLERY_VIDEOS.map((item, index) => {
          const isHero = index === 0;
          const isVideo = Boolean(item.src);
          return (
            <motion.li
              key={item.id}
              className={cn("min-h-0", TILE_CLASS[index] ?? "aspect-[4/3]")}
              initial={reduceMotion ? false : { opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{
                duration: 0.5,
                delay: reduceMotion ? 0 : index * 0.05,
                ease: EASE,
              }}
            >
              <button
                type="button"
                onClick={() => setActive(item)}
                aria-label={
                  isVideo ? `Play ${item.title}` : `View ${item.title}`
                }
                className="group relative block h-full w-full overflow-hidden rounded-lg bg-surface text-left outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 active:scale-[0.985]"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.poster}
                  alt=""
                  className="h-full w-full object-cover transition-transform duration-600 ease-[cubic-bezier(0.16,1,0.3,1)] [@media(hover:hover)_and_(pointer:fine)]:group-hover:scale-[1.04]"
                  loading="lazy"
                  decoding="async"
                />
                <span
                  className={cn(
                    "absolute inset-0 bg-gradient-to-t from-ink/65 via-ink/10 to-transparent",
                    isHero && "from-ink/75",
                  )}
                />
                {isVideo ? (
                  <span
                    className={cn(
                      "absolute flex items-center justify-center rounded-full bg-paper text-ink transition-transform duration-160 ease-[cubic-bezier(0.23,1,0.32,1)] group-active:scale-[0.97]",
                      isHero
                        ? "top-1/2 left-1/2 size-16 -translate-x-1/2 -translate-y-1/2 opacity-95"
                        : "top-3 right-3 size-10 opacity-90",
                    )}
                  >
                    <IconPlayerPlay
                      size={isHero ? 22 : 16}
                      stroke={1.75}
                      fill="currentColor"
                      className="ml-0.5"
                    />
                  </span>
                ) : null}
                <span
                  className={cn(
                    "absolute right-4 bottom-4 left-4",
                    isHero && "md:right-6 md:bottom-6 md:left-6",
                  )}
                >
                  <span
                    className={cn(
                      "block font-semibold tracking-[-0.02em] text-paper",
                      isHero ? "text-2xl md:text-3xl" : "text-base",
                    )}
                  >
                    {item.title}
                  </span>
                  <span
                    className={cn(
                      "mt-1 block text-paper/75",
                      isHero ? "max-w-[36ch] text-sm md:text-base" : "text-sm",
                    )}
                  >
                    {isHero ? item.caption : (item.duration ?? item.caption)}
                  </span>
                </span>
              </button>
            </motion.li>
          );
        })}
      </ul>

      <VideoLightbox video={active} onClose={() => setActive(null)} />
    </div>
  );
}
