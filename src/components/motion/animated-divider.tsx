"use client";

import { motion, useReducedMotion } from "motion/react";
import { PREMIUM_EASE } from "./motion-config";
import { cn } from "@/lib/utils";

type AnimatedDividerProps = {
  className?: string;
  animateOnMount?: boolean;
  delay?: number;
};

export function AnimatedDivider({
  className,
  animateOnMount = false,
  delay = 0.5,
}: AnimatedDividerProps) {
  const reduceMotion = useReducedMotion();

  if (reduceMotion) {
    return (
      <div
        className={cn(
          "h-px max-w-md bg-linear-to-r from-primary/40 via-primary/15 to-transparent",
          className,
        )}
        aria-hidden
      />
    );
  }

  const motionProps = animateOnMount
    ? {
        initial: { scaleX: 0, opacity: 0 },
        animate: { scaleX: 1, opacity: 1 },
      }
    : {
        initial: { scaleX: 0, opacity: 0 },
        whileInView: { scaleX: 1, opacity: 1 },
        viewport: { once: true, margin: "-8% 0px" },
      };

  return (
    <motion.div
      className={cn(
        "h-px max-w-md bg-linear-to-r from-primary/40 via-primary/15 to-transparent",
        className,
      )}
      aria-hidden
      {...motionProps}
      transition={{ duration: 0.8, delay, ease: PREMIUM_EASE }}
      style={{ transformOrigin: "left center" }}
    />
  );
}
