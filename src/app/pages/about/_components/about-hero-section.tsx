"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "motion/react";
import { TextGenerateEffect } from "@/components/ui/text-generate-effect";
import { AnimatedDivider } from "@/components/motion/animated-divider";
import { AboutRevealItem, AboutStagger } from "./about-reveal";

const ABOUT_HERO_IMAGE =
  "/hero/gpt-image-2_minimalist_abstract_logistics_background_sleek_delivery_van_and_stacked_parcels_-0.jpg";

const ABOUT_HERO_IMAGE_ALT =
  "Urban Move Logistics delivery van and stacked parcels on route in Aberdeen and across the UK";

const HEADLINE = "About Urban Move";

const INTRO =
  "Urban Move is Aberdeen's trusted man and van and removal company, providing affordable, reliable, and professional moving services across Aberdeen and throughout the UK. We specialise in house removals, office relocations, house clearance, skip hire, furniture collection and delivery, packing services, furniture assembly and dismantling, courier and logistics, local parcel delivery, student moves, and same-day transport solutions. Whether you need a single item moved or a full house relocation, our experienced team and fleet of vans deliver a fast, safe, and stress-free service at competitive prices.";

export function AboutHeroSection() {
  const reduceMotion = useReducedMotion();

  return (
    <section
      className="relative min-h-[min(72vh,680px)] overflow-hidden bg-paper pt-28 pb-16 sm:pt-32 sm:pb-20 lg:min-h-[min(78vh,760px)] lg:pt-36 lg:pb-24"
      aria-labelledby="about-hero-heading"
    >
      <div className="pointer-events-none absolute inset-0">
        <Image
          src={ABOUT_HERO_IMAGE}
          alt={ABOUT_HERO_IMAGE_ALT}
          fill
          priority
          sizes="100vw"
          className="object-cover object-[center_right] sm:object-right"
        />
        <div className="absolute inset-0 bg-linear-to-r from-paper from-0% via-paper via-65% to-paper/20 sm:from-35% sm:via-paper/95 sm:via-55% sm:to-transparent lg:from-40% lg:via-60%" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-[inherit] w-full max-w-6xl items-center px-6 sm:px-10 lg:px-16">
        <AboutStagger
          className="w-full min-w-0 max-w-2xl lg:max-w-3xl"
          animateOnMount
        >
          <AboutRevealItem>
            <div id="about-hero-heading">
              <TextGenerateEffect
                as="h1"
                words={HEADLINE}
                duration={0.45}
                staggerDelay={0.04}
                className="text-[clamp(2.25rem,5.5vw,4.5rem)] leading-[1.05] font-semibold tracking-[-0.03em] text-balance text-ink"
              />
            </div>
          </AboutRevealItem>

          <AboutRevealItem>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-ink/90 sm:mt-6 sm:text-lg text-pretty">
              {INTRO}
            </p>
          </AboutRevealItem>
          <AboutRevealItem>
            <AnimatedDivider className="mt-10" animateOnMount delay={0.55} />
          </AboutRevealItem>
        </AboutStagger>
      </div>

      {!reduceMotion ? (
        <motion.div
          className="pointer-events-none absolute right-0 bottom-0 h-px w-full max-w-md bg-linear-to-r from-transparent via-primary/30 to-transparent lg:max-w-xl"
          aria-hidden
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: 1, opacity: 1 }}
          transition={{ duration: 1, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
          style={{ transformOrigin: "left center" }}
        />
      ) : null}
    </section>
  );
}
