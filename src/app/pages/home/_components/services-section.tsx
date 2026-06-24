"use client";

import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { StickyScroll } from "@/components/ui/sticky-scroll";
import { getHomeStickyScrollContent } from "@/lib/services-data";

export function ServicesSection() {
  const content = getHomeStickyScrollContent();
  return (
    <section
      id="services-detail"
      className="bg-paper py-16 sm:py-20 lg:py-24"
      aria-labelledby="services-detail-heading"
    >
      <div className="mx-auto max-w-6xl px-6 sm:px-10 lg:px-16">
        <ScrollReveal className="mb-10 max-w-2xl">
          <p className="text-sm font-medium tracking-[0.12em] text-muted uppercase">
            Our services
          </p>
          <h2
            id="services-detail-heading"
            className="mt-3 text-[clamp(1.75rem,4vw,2.5rem)] leading-tight font-semibold tracking-[-0.02em] text-ink"
          >
            Logistics built around you
          </h2>
        </ScrollReveal>

        <StickyScroll content={content} />
      </div>
    </section>
  );
}
