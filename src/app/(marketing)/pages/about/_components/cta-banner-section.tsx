"use client";

import { motion, useReducedMotion } from "motion/react";
import { MagneticButton } from "@/components/motion/magnetic-button";
import { PageReveal, PageRevealItem, PageStagger } from "@/components/motion/page-reveal";
import { QUOTE_HREF } from "@/components/layout/nav-config";

export function CtaBannerSection() {
  const reduceMotion = useReducedMotion();

  return (
    <section
      className="bg-surface py-24 sm:py-28 lg:py-32"
      aria-labelledby="cta-heading"
    >
      <div className="mx-auto max-w-6xl px-6 sm:px-10 lg:px-16">
        <PageReveal>
          <motion.div
            className="relative overflow-hidden rounded-3xl bg-ink px-8 py-14 sm:px-12 sm:py-16 lg:px-16 lg:py-20"
            initial={reduceMotion ? false : { scale: 0.98, opacity: 0 }}
            whileInView={reduceMotion ? undefined : { scale: 1, opacity: 1 }}
            viewport={{ once: true, margin: "-8% 0px" }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
            {!reduceMotion ? (
              <motion.div
                className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(240,58,47,0.18),transparent_60%)]"
                aria-hidden
                animate={{ opacity: [0.6, 1, 0.6] }}
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            ) : (
              <div
                className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(240,58,47,0.18),transparent_60%)]"
                aria-hidden
              />
            )}

            <PageStagger className="relative z-10 mx-auto max-w-2xl text-center">
              <PageRevealItem>
                <h2
                  id="cta-heading"
                  className="text-[clamp(1.75rem,4vw,2.75rem)] leading-tight font-semibold tracking-tight text-paper text-balance"
                >
                  Experience logistics, elevated.
                </h2>
              </PageRevealItem>

              <PageRevealItem>
                <p className="mt-5 text-base leading-relaxed text-paper/80 sm:text-lg text-pretty">
                  Whether you are moving a high-end corporate office, handling
                  student relocation, or clearing a residential space, we treat
                  your transition as our top priority.
                </p>
              </PageRevealItem>

              <PageRevealItem>
                <div className="mt-10">
                  <MagneticButton
                    href={QUOTE_HREF}
                    className="h-12 bg-tertiary px-8 text-ink hover:bg-tertiary-hover"
                  >
                    Get a quote
                  </MagneticButton>
                </div>
              </PageRevealItem>
            </PageStagger>
          </motion.div>
        </PageReveal>
      </div>
    </section>
  );
}
