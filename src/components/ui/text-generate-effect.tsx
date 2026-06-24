"use client";

import { useEffect } from "react";
import { motion, stagger, useAnimate, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

type TextGenerateEffectProps = {
  words: string;
  className?: string;
  wordClassName?: string;
  filter?: boolean;
  duration?: number;
  staggerDelay?: number;
  as?: "h1" | "p" | "div";
};

export function TextGenerateEffect({
  words,
  className,
  wordClassName,
  filter = true,
  duration = 0.5,
  staggerDelay = 0.12,
  as: Component = "div",
}: TextGenerateEffectProps) {
  const [scope, animate] = useAnimate();
  const reduceMotion = useReducedMotion();
  const wordsArray = words.split(" ");

  useEffect(() => {
    if (reduceMotion) return;

    void animate(
      "span",
      {
        opacity: 1,
        filter: filter ? "blur(0px)" : "none",
      },
      {
        duration,
        delay: stagger(staggerDelay),
      },
    );
  }, [animate, duration, filter, reduceMotion, staggerDelay, words]);

  return (
    <Component className={cn(className)}>
      <motion.div ref={scope}>
        {wordsArray.map((word, index) => (
          <motion.span
            key={`${word}-${index}`}
            className={cn(!reduceMotion && "opacity-0", wordClassName)}
            style={{
              filter: !reduceMotion && filter ? "blur(10px)" : "none",
            }}
          >
            {word}
            {index < wordsArray.length - 1 ? " " : ""}
          </motion.span>
        ))}
      </motion.div>
    </Component>
  );
}
