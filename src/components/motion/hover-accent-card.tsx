"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";
import { PREMIUM_EASE } from "./motion-config";

type HoverAccentCardProps = {
  children: React.ReactNode;
  className?: string;
  as?: "article" | "div" | "li";
};

export function HoverAccentCard({
  children,
  className,
  as: Component = "div",
}: HoverAccentCardProps) {
  const reduceMotion = useReducedMotion();
  const [isHovering, setIsHovering] = useState(false);

  return (
    <motion.div
      className={cn("group h-full", className)}
      onMouseEnter={() => !reduceMotion && setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      animate={
        reduceMotion
          ? undefined
          : {
              y: isHovering ? -3 : 0,
            }
      }
      transition={{ duration: 0.35, ease: PREMIUM_EASE }}
    >
      <Component
        className={cn(
          "relative h-full overflow-hidden rounded-2xl border border-border bg-paper transition-colors duration-200",
          isHovering && "border-primary/25",
        )}
      >
        <motion.div
          className="absolute top-0 left-0 h-px w-full bg-linear-to-r from-primary/80 via-primary/40 to-transparent"
          initial={false}
          animate={{ scaleX: isHovering ? 1 : 0 }}
          transition={{ duration: 0.45, ease: PREMIUM_EASE }}
          style={{ transformOrigin: "left center" }}
          aria-hidden
        />
        <div className="relative z-10">{children}</div>
      </Component>
    </motion.div>
  );
}
