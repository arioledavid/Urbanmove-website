"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { HoverAccentCard } from "@/components/motion/hover-accent-card";
import { FADE_UP_SUBTLE } from "@/components/motion/motion-config";
import { PageRevealItem, PageStagger } from "@/components/motion/page-reveal";
import { SectionHeader } from "@/components/motion/section-header";

type Pillar = {
  title: string;
  body: string;
  span: string;
};

const PILLARS: Pillar[] = [
  {
    title: "Meticulous Execution",
    body: "We measure our success in minutes and millimeters. From securing high value commercial cargo to assembling bespoke furniture, our team is trained to execute every detail with flawless precision.",
    span: "lg:col-span-2",
  },
  {
    title: "Live Visibility",
    body: "Uncertainty has no place in premium logistics. We keep you tethered to your assets with clear, proactive communication and reliable tracking from the second we dispatch to the final signature.",
    span: "lg:col-span-1",
  },
  {
    title: "Responsible Movement",
    body: "Moving forward shouldn't mean leaving a footprint behind. Our clearance services prioritize fully licensed, eco certified disposal networks, ensuring that household and commercial waste is recycled or repurposed responsibly.",
    span: "lg:col-span-3",
  },
];

function PillarCard({ title, body, span }: Pillar) {
  return (
    <PageRevealItem className={span} variants={FADE_UP_SUBTLE}>
      <HoverAccentCard as="article">
        <div className="p-8 sm:p-10">
          <h3 className="text-xl font-semibold tracking-tight text-ink sm:text-2xl">
            {title}
          </h3>
          <p className="mt-4 max-w-prose text-sm leading-relaxed text-muted sm:text-base">
            {body}
          </p>
        </div>
      </HoverAccentCard>
    </PageRevealItem>
  );
}

export function PillarsSection() {
  return (
    <section
      className="bg-surface py-24 sm:py-28 lg:py-32"
      aria-labelledby="pillars-heading"
    >
      <div className="mx-auto max-w-6xl px-6 sm:px-10 lg:px-16">
        <SectionHeader
          eyebrow="Core pillars"
          title="Built for precision at every touchpoint"
          titleId="pillars-heading"
          className="mb-12 lg:mb-16"
        />

        <PageStagger
          className="grid grid-cols-1 gap-4 lg:grid-cols-3 lg:gap-5"
          grid
        >
          {PILLARS.map((pillar) => (
            <PillarCard key={pillar.title} {...pillar} />
          ))}
        </PageStagger>
      </div>
    </section>
  );
}
