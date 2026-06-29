"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { QUOTE_HREF } from "@/components/layout/nav-config";
import { LayoutTextFlip } from "@/components/ui/layout-text-flip";
import { TextGenerateEffect } from "@/components/ui/text-generate-effect";
import { getHomeHeroServiceTitles } from "@/lib/services-data";

const HERO_SERVICES = getHomeHeroServiceTitles();

const HEADLINE = "We move what matters.";

const easeOut = [0.22, 1, 0.36, 1] as const;

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.14,
      delayChildren: 0.55,
    },
  },
};

const fadeUpVariants = {
  hidden: {
    opacity: 0,
    y: 28,
    filter: "blur(10px)",
  },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      duration: 0.65,
      ease: easeOut,
    },
  },
};

export function HeroContent() {
  const reduceMotion = useReducedMotion();

  const motionProps = reduceMotion
    ? { initial: false as const }
    : { initial: "hidden" as const, animate: "visible" as const };

  return (
    <motion.div
      className="w-full min-w-0 max-w-3xl"
      variants={containerVariants}
      {...motionProps}
    >
      <TextGenerateEffect
        as="h1"
        words={HEADLINE}
        duration={0.55}
        staggerDelay={0.1}
        className="text-[clamp(2.25rem,5.5vw,4.5rem)] leading-[1.05] font-semibold tracking-[-0.03em] text-balance text-paper"
      />

      <motion.div variants={reduceMotion ? undefined : fadeUpVariants}>
        <LayoutTextFlip
          className="mt-5"
          text="Your premium partner for UK"
          words={HERO_SERVICES}
          textClassName="text-paper/90"
          pillClassName="bg-paper text-ink"
        />
      </motion.div>

      <motion.div
        variants={reduceMotion ? undefined : fadeUpVariants}
        className="pointer-events-auto mt-12 flex flex-col gap-3 sm:mt-14 sm:flex-row sm:items-center"
      >
        <Link
          href={QUOTE_HREF}
          className="inline-flex h-12 items-center justify-center rounded-full bg-primary px-6 text-sm font-medium text-paper transition-colors hover:bg-primary-hover"
        >
          Get an Instant Quote
        </Link>
        <Link
          href="/services"
          className="inline-flex h-12 items-center justify-center rounded-full border border-paper bg-transparent px-6 text-sm font-medium text-paper transition-colors hover:bg-paper/10"
        >
          View Services
        </Link>
      </motion.div>
    </motion.div>
  );
}
