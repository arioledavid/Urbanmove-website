"use client";

import { useState } from "react";
import {
  IconRecycle,
  IconShield,
  IconTarget,
} from "@tabler/icons-react";
import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";
import { PREMIUM_EASE } from "@/components/motion/motion-config";
import { PageRevealItem, PageStagger } from "@/components/motion/page-reveal";
import { SectionHeader } from "@/components/motion/section-header";
import { FADE_UP_SUBTLE } from "./motion-config";

type Value = {
  icon: React.ReactNode;
  title: string;
  body: string;
};

const VALUES: Value[] = [
  {
    icon: <IconTarget className="h-6 w-6" stroke={1.5} aria-hidden />,
    title: "Precision First",
    body: "Every detail mapped, measured, and timed.",
  },
  {
    icon: <IconShield className="h-6 w-6" stroke={1.5} aria-hidden />,
    title: "Absolute Protection",
    body: "Fully insured, thoroughly vetted transport professionals only.",
  },
  {
    icon: <IconRecycle className="h-6 w-6" stroke={1.5} aria-hidden />,
    title: "Eco Certified Flow",
    body: "Licensed, highly responsible waste disposal and recycling pipelines.",
  },
];

function ValueItem({ icon, title, body }: Value) {
  const reduceMotion = useReducedMotion();
  const [isHovering, setIsHovering] = useState(false);

  return (
    <PageRevealItem variants={FADE_UP_SUBTLE}>
      <motion.div
        onMouseEnter={() => !reduceMotion && setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        animate={
          reduceMotion
            ? undefined
            : {
                y: isHovering ? -4 : 0,
              }
        }
        transition={{ duration: 0.35, ease: PREMIUM_EASE }}
        className="group flex flex-col items-start text-left"
      >
        <motion.div
          animate={
            reduceMotion
              ? undefined
              : {
                  scale: isHovering ? 1.06 : 1,
                }
          }
          transition={{ type: "spring", stiffness: 400, damping: 22 }}
          className={cn(
            "mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl",
            "border border-border bg-paper text-primary",
            "transition-colors duration-300 group-hover:border-primary/30",
          )}
        >
          {icon}
        </motion.div>
        <h3 className="text-lg font-semibold tracking-tight text-ink sm:text-xl">
          {title}
        </h3>
        <p className="mt-2 max-w-xs text-sm leading-relaxed text-muted sm:text-base">
          {body}
        </p>
      </motion.div>
    </PageRevealItem>
  );
}

export function ValuesSection() {
  return (
    <section
      className="border-y border-border bg-paper py-24 sm:py-28 lg:py-32"
      aria-labelledby="values-heading"
    >
      <div className="mx-auto max-w-6xl px-6 sm:px-10 lg:px-16">
        <SectionHeader
          eyebrow="Our values"
          title="What guides every move we make"
          titleId="values-heading"
          align="center"
          className="mb-14 lg:mb-16"
        />

        <PageStagger
          className="grid grid-cols-1 gap-12 sm:grid-cols-3 sm:gap-8 lg:gap-12"
          grid
        >
          {VALUES.map((value) => (
            <ValueItem key={value.title} {...value} />
          ))}
        </PageStagger>
      </div>
    </section>
  );
}
