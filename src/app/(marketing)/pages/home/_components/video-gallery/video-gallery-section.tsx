"use client";

import { GalleryDesign6 } from "./gallery-design-6";
import { GalleryDesign7 } from "./gallery-design-7";

export function VideoGallerySection() {
  return (
    <section
      id="video-gallery"
      className="bg-paper py-16 sm:py-20 lg:py-24"
      aria-labelledby="video-gallery-heading"
    >
      <div className="mx-auto max-w-6xl px-6 sm:px-10 lg:px-16">
        <div className="mb-8 max-w-2xl md:mb-10">
          <h2
            id="video-gallery-heading"
            className="text-[clamp(1.75rem,4vw,2.5rem)] leading-tight font-semibold tracking-[-0.02em] text-ink text-balance"
          >
            On the Job in Aberdeen
          </h2>
          <p className="mt-3 text-base leading-relaxed text-ink/70 text-pretty sm:text-lg">
            Man and van, house removals, furniture delivery, and piano moves
            captured in Aberdeen.
          </p>
        </div>

        <div className="md:hidden">
          <GalleryDesign7 />
        </div>
        <div className="hidden md:block">
          <GalleryDesign6 />
        </div>
      </div>
    </section>
  );
}
