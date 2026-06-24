"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "@/lib/utils";

type LayoutTextFlipProps = {
  text: string;
  words: string[];
  duration?: number;
  className?: string;
  textClassName?: string;
  pillClassName?: string;
  wordClassName?: string;
};

export function LayoutTextFlip({
  text,
  words,
  duration = 3000,
  className,
  textClassName,
  pillClassName,
  wordClassName,
}: LayoutTextFlipProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updateMotion = () => setReduceMotion(motionQuery.matches);

    updateMotion();
    motionQuery.addEventListener("change", updateMotion);

    return () => motionQuery.removeEventListener("change", updateMotion);
  }, []);

  useEffect(() => {
    if (reduceMotion || words.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % words.length);
    }, duration);

    return () => clearInterval(interval);
  }, [duration, reduceMotion, words]);

  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-x-2 gap-y-2",
        className,
      )}
    >
      <motion.span
        layoutId="subtext"
        className={cn(
          "text-lg font-semibold tracking-tight md:text-xl lg:text-2xl",
          textClassName,
        )}
      >
        {text}
      </motion.span>

      <motion.span
        layout
        className={cn(
          "relative w-fit overflow-hidden rounded-md border border-transparent bg-paper px-3 py-1.5 font-sans text-lg font-semibold tracking-tight text-ink shadow-sm ring shadow-black/10 ring-black/10 md:px-4 md:py-2 md:text-xl lg:text-2xl",
          pillClassName,
        )}
      >
        {reduceMotion ? (
          <span className={cn("inline-block whitespace-nowrap", wordClassName)}>
            {words[0]}
          </span>
        ) : (
          <AnimatePresence mode="popLayout">
            <motion.span
              key={currentIndex}
              initial={{ y: -40, filter: "blur(10px)" }}
              animate={{
                y: 0,
                filter: "blur(0px)",
              }}
              exit={{ y: 50, filter: "blur(10px)", opacity: 0 }}
              transition={{
                duration: 0.5,
              }}
              className={cn("inline-block whitespace-nowrap", wordClassName)}
            >
              {words[currentIndex]}
            </motion.span>
          </AnimatePresence>
        )}
      </motion.span>
    </div>
  );
}
