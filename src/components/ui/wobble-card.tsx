"use client";

import { useState, type ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

type WobbleCardProps = {
  children: ReactNode;
  containerClassName?: string;
  className?: string;
  highlight?: boolean;
};

function WobbleCardNoise() {
  return (
    <div
      className="pointer-events-none absolute inset-0 h-full w-full scale-[1.2] transform opacity-10 mask-[radial-gradient(#fff,transparent,75%)]"
      style={{
        backgroundImage: "url(/noise.png)",
        backgroundSize: "30%",
      }}
      aria-hidden
    />
  );
}

export function WobbleCard({
  children,
  containerClassName,
  className,
  highlight = false,
}: WobbleCardProps) {
  const reduceMotion = useReducedMotion();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  const handleMouseMove = (event: React.MouseEvent<HTMLElement>) => {
    if (reduceMotion) return;

    const { clientX, clientY } = event;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = (clientX - (rect.left + rect.width / 2)) / 20;
    const y = (clientY - (rect.top + rect.height / 2)) / 20;
    setMousePosition({ x, y });
  };

  const outerTransform =
    !reduceMotion && isHovering
      ? `translate3d(${mousePosition.x}px, ${mousePosition.y}px, 0) scale3d(1, 1, 1)`
      : "translate3d(0px, 0px, 0) scale3d(1, 1, 1)";

  const innerTransform =
    !reduceMotion && isHovering
      ? `translate3d(${-mousePosition.x}px, ${-mousePosition.y}px, 0) scale3d(1.03, 1.03, 1)`
      : "translate3d(0px, 0px, 0) scale3d(1, 1, 1)";

  return (
    <motion.section
      onMouseMove={handleMouseMove}
      onMouseEnter={() => !reduceMotion && setIsHovering(true)}
      onMouseLeave={() => {
        setIsHovering(false);
        setMousePosition({ x: 0, y: 0 });
      }}
      style={{
        transform: outerTransform,
        transition: "transform 0.1s ease-out",
      }}
      className={cn(
        "relative mx-auto w-full overflow-hidden rounded-2xl",
        containerClassName,
      )}
    >
      <div
        className="relative h-full overflow-hidden bg-[radial-gradient(88%_100%_at_top,rgba(255,255,255,0.5),rgba(255,255,255,0))] sm:mx-0 sm:rounded-2xl"
        style={{
          boxShadow:
            "0 10px 32px rgba(34, 42, 53, 0.12), 0 1px 1px rgba(0, 0, 0, 0.05), 0 0 0 1px rgba(34, 42, 53, 0.05), 0 4px 6px rgba(34, 42, 53, 0.08), 0 24px 108px rgba(47, 48, 55, 0.10)",
        }}
      >
        <motion.div
          style={{
            transform: innerTransform,
            transition: "transform 0.1s ease-out",
          }}
          className={cn(
            "relative h-full px-6 py-10 sm:px-8 sm:py-12 lg:px-10 lg:py-14",
            className,
          )}
        >
          <WobbleCardNoise />
          {highlight ? (
            <div
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(240,58,47,0.35),transparent_55%)]"
              aria-hidden
            />
          ) : null}
          <div className="relative z-10">{children}</div>
        </motion.div>
      </div>
    </motion.section>
  );
}
