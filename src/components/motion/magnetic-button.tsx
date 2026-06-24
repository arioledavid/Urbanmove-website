"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

type MagneticButtonProps = {
  href: string;
  children: React.ReactNode;
  className?: string;
};

export function MagneticButton({
  href,
  children,
  className,
}: MagneticButtonProps) {
  const reduceMotion = useReducedMotion();
  const buttonRef = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (reduceMotion || !buttonRef.current) return;

    const rect = buttonRef.current.getBoundingClientRect();
    const x = (event.clientX - rect.left - rect.width / 2) * 0.12;
    const y = (event.clientY - rect.top - rect.height / 2) * 0.12;
    setOffset({ x, y });
  };

  const handleMouseLeave = () => {
    setOffset({ x: 0, y: 0 });
  };

  return (
    <motion.div
      ref={buttonRef}
      className="inline-block"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      animate={
        reduceMotion
          ? undefined
          : {
              x: offset.x,
              y: offset.y,
            }
      }
      transition={{ type: "spring", stiffness: 350, damping: 25 }}
      whileHover={reduceMotion ? undefined : { scale: 1.02 }}
      whileTap={reduceMotion ? undefined : { scale: 0.97 }}
    >
      <Link
        href={href}
        className={cn(
          "inline-flex h-12 items-center justify-center rounded-full bg-primary px-8 text-sm font-medium text-paper transition-colors duration-200 hover:bg-primary-hover",
          className,
        )}
      >
        {children}
      </Link>
    </motion.div>
  );
}
