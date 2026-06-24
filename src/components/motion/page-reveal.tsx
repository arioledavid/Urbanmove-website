"use client";

import { motion, useReducedMotion, type Variants } from "motion/react";
import { cn } from "@/lib/utils";
import {
  FADE_UP,
  PREMIUM_TRANSITION,
  STAGGER_CONTAINER,
  STAGGER_GRID,
} from "./motion-config";

type PageRevealProps = {
  children: React.ReactNode;
  className?: string;
  delay?: number;
};

export function PageReveal({ children, className, delay = 0 }: PageRevealProps) {
  const reduceMotion = useReducedMotion();

  if (reduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={cn(className)}
      initial={{ opacity: 0, y: 28, filter: "blur(10px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, margin: "-8% 0px" }}
      transition={{ ...PREMIUM_TRANSITION, delay }}
    >
      {children}
    </motion.div>
  );
}

type PageRevealItemProps = {
  children: React.ReactNode;
  className?: string;
  variants?: Variants;
};

export function PageRevealItem({
  children,
  className,
  variants = FADE_UP,
}: PageRevealItemProps) {
  const reduceMotion = useReducedMotion();

  if (reduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div className={cn(className)} variants={variants}>
      {children}
    </motion.div>
  );
}

type PageStaggerProps = {
  children: React.ReactNode;
  className?: string;
  grid?: boolean;
  animateOnMount?: boolean;
};

export function PageStagger({
  children,
  className,
  grid = false,
  animateOnMount = false,
}: PageStaggerProps) {
  const reduceMotion = useReducedMotion();
  const variants = grid ? STAGGER_GRID : STAGGER_CONTAINER;

  if (reduceMotion) {
    return <div className={className}>{children}</div>;
  }

  const motionProps = animateOnMount
    ? { initial: "hidden" as const, animate: "visible" as const }
    : {
        initial: "hidden" as const,
        whileInView: "visible" as const,
        viewport: { once: true, margin: "-8% 0px" },
      };

  return (
    <motion.div className={cn(className)} variants={variants} {...motionProps}>
      {children}
    </motion.div>
  );
}
