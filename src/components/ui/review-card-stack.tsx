"use client";

import { motion, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import type { GoogleReview } from "@/lib/reviews-data";
import { GoogleReviewContent } from "@/components/reviews/google-review-content";
import { cn } from "@/lib/utils";

type ReviewCardStackProps = {
  reviews: GoogleReview[];
  offset?: number;
  scaleFactor?: number;
  intervalMs?: number;
  className?: string;
};

export function ReviewCardStack({
  reviews,
  offset = 10,
  scaleFactor = 0.06,
  intervalMs = 5000,
  className,
}: ReviewCardStackProps) {
  const reduceMotion = useReducedMotion();
  const [cards, setCards] = useState(reviews);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const stackInset = (cards.length - 1) * offset;

  useEffect(() => {
    setCards(reviews);
  }, [reviews]);

  useEffect(() => {
    if (reduceMotion) return;

    intervalRef.current = setInterval(() => {
      setCards((prevCards) => {
        const next = [...prevCards];
        const last = next.pop();
        if (last) next.unshift(last);
        return next;
      });
    }, intervalMs);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [intervalMs, reduceMotion]);

  return (
    <div
      className={cn(
        "relative w-[min(100%,20rem)] sm:w-96",
        className,
      )}
      style={{ minHeight: `calc(14rem + ${stackInset}px)` }}
    >
      {cards.map((review, index) => (
        <motion.div
          key={review.id}
          className="absolute inset-x-0 flex min-h-56 flex-col justify-between rounded-3xl border border-border bg-paper p-5 shadow-lg shadow-ink/10"
          style={{ transformOrigin: "top center" }}
          animate={{
            top: stackInset + index * -offset,
            scale: 1 - index * scaleFactor,
            zIndex: cards.length - index,
          }}
          transition={{ duration: 0.35, ease: "easeInOut" }}
        >
          <GoogleReviewContent review={review} compact />
        </motion.div>
      ))}
    </div>
  );
}
