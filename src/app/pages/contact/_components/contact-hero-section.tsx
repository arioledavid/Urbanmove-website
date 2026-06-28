"use client";

import { TextGenerateEffect } from "@/components/ui/text-generate-effect";
import { AnimatedDivider } from "@/components/motion/animated-divider";
import {
  PageRevealItem,
  PageStagger,
} from "@/components/motion/page-reveal";

const HEADLINE = "Get a free quote in Aberdeen.";

const TRUST_POINTS = [
  "Fully insured",
  "Aberdeen-based team",
  "Same-day available",
] as const;

export function ContactHeroSection() {
  return (
    <section
      className="relative overflow-hidden border-b border-border bg-paper pt-28 pb-12 sm:pt-32 sm:pb-16 lg:pt-36 lg:pb-20"
      aria-labelledby="contact-hero-heading"
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(240,58,47,0.05),transparent_50%)]"
        aria-hidden
      />

      <div className="relative z-10 mx-auto max-w-6xl px-6 sm:px-10 lg:px-16">
        <PageStagger className="w-full min-w-0 max-w-2xl" animateOnMount>
          <PageRevealItem>
            <p className="text-sm font-medium tracking-[0.08em] text-primary uppercase">
              Contact us
            </p>
          </PageRevealItem>

          <PageRevealItem>
            <div id="contact-hero-heading">
              <TextGenerateEffect
                as="h1"
                words={HEADLINE}
                duration={0.45}
                staggerDelay={0.04}
                className="mt-3 text-[clamp(1.875rem,4.5vw,3.25rem)] leading-[1.1] font-semibold tracking-[-0.03em] text-balance text-ink"
              />
            </div>
          </PageRevealItem>

          <PageRevealItem>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-muted sm:text-lg text-pretty">
              Tell us what you need moved in Aberdeen — house and office
              removals, same-day courier, furniture delivery and assembly,
              household waste clearance, student moves or cargo freight — and
              we will come back with a clear, no-obligation quote.
            </p>
          </PageRevealItem>

          <PageRevealItem>
            <AnimatedDivider className="mt-8" animateOnMount delay={0.45} />
          </PageRevealItem>

          <PageRevealItem>
            <ul className="mt-8 flex flex-wrap gap-2.5">
              {TRUST_POINTS.map((point) => (
                <li
                  key={point}
                  className="rounded-full border border-border bg-surface px-4 py-2 text-sm font-medium text-ink/85"
                >
                  {point}
                </li>
              ))}
            </ul>
          </PageRevealItem>
        </PageStagger>
      </div>
    </section>
  );
}
