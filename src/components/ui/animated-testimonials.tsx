"use client";

import Image from "next/image";
import { IconArrowLeft, IconArrowRight } from "@tabler/icons-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { GoogleReview } from "@/lib/reviews-data";
import { GoogleReviewBadge } from "@/components/reviews/google-review-badge";
import { StarRating } from "@/components/ui/star-rating";
import { RelativeReviewDate } from "@/components/reviews/relative-review-date";
import { cn } from "@/lib/utils";

type AnimatedTestimonialsProps = {
  testimonials: GoogleReview[];
  autoplay?: boolean;
  className?: string;
};

function stableRotate(id: number) {
  return ((id * 7) % 21) - 10;
}

export function AnimatedTestimonials({
  testimonials,
  autoplay = true,
  className,
}: AnimatedTestimonialsProps) {
  const reduceMotion = useReducedMotion();
  const [active, setActive] = useState(0);

  const rotations = useMemo(
    () => testimonials.map((item) => stableRotate(item.id)),
    [testimonials],
  );

  const handleNext = useCallback(() => {
    setActive((prev) => (prev + 1) % testimonials.length);
  }, [testimonials.length]);

  const handlePrev = useCallback(() => {
    setActive((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  }, [testimonials.length]);

  useEffect(() => {
    if (!autoplay || reduceMotion) return;

    const interval = setInterval(handleNext, 5000);
    return () => clearInterval(interval);
  }, [autoplay, handleNext, reduceMotion]);

  const isActive = (index: number) => index === active;
  const activeReview = testimonials[active];

  return (
    <div className={cn("mx-auto w-full max-w-5xl", className)}>
      <div className="relative grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16">
        <div>
          <div className="relative mx-auto size-36 max-w-full sm:size-40">
            <AnimatePresence>
              {testimonials.map((testimonial, index) => (
                <motion.div
                  key={testimonial.id}
                  initial={
                    reduceMotion
                      ? false
                      : {
                          opacity: 0,
                          scale: 0.9,
                          rotate: rotations[index],
                        }
                  }
                  animate={{
                    opacity: isActive(index) ? 1 : 0.7,
                    scale: isActive(index) ? 1 : 0.95,
                    rotate: isActive(index) ? 0 : rotations[index],
                    zIndex: isActive(index)
                      ? 40
                      : testimonials.length + 2 - index,
                    y: reduceMotion || !isActive(index) ? 0 : [0, -12, 0],
                  }}
                  exit={
                    reduceMotion
                      ? undefined
                      : {
                          opacity: 0,
                          scale: 0.9,
                          rotate: rotations[index],
                        }
                  }
                  transition={{
                    duration: 0.4,
                    ease: "easeInOut",
                  }}
                  className="absolute inset-0 origin-bottom"
                >
                  <div className="relative aspect-square h-full w-full overflow-hidden rounded-full border border-border bg-paper shadow-lg shadow-ink/10">
                    <Image
                      src={testimonial.image}
                      alt={testimonial.name}
                      fill
                      draggable={false}
                      unoptimized
                      className="object-cover object-center"
                      sizes="(max-width: 640px) 144px, 160px"
                    />
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        <div className="flex flex-col justify-between py-2">
          <motion.div
            key={activeReview.id}
            initial={reduceMotion ? false : { y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="rounded-2xl border border-border bg-paper p-6 shadow-sm"
          >
            <div className="mb-4 flex items-center justify-between gap-4">
              <div>
                <h3 className="text-2xl font-semibold tracking-tight text-ink">
                  {activeReview.name}
                </h3>
                <RelativeReviewDate
                  postedAt={activeReview.postedAt}
                  className="mt-1 block text-sm text-muted"
                />
              </div>
              <StarRating rating={activeReview.rating} />
            </div>

            {reduceMotion ? (
              <p className="text-base leading-relaxed text-ink/80">
                {activeReview.comment}
              </p>
            ) : (
              <p className="text-base leading-relaxed text-ink/80">
                {activeReview.comment.split(" ").map((word, index) => (
                  <motion.span
                    key={`${activeReview.id}-${index}`}
                    initial={{ filter: "blur(10px)", opacity: 0, y: 5 }}
                    animate={{ filter: "blur(0px)", opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.2,
                      ease: "easeInOut",
                      delay: 0.02 * index,
                    }}
                    className="inline-block"
                  >
                    {word}&nbsp;
                  </motion.span>
                ))}
              </p>
            )}

            <div className="mt-6 border-t border-border pt-4">
              <GoogleReviewBadge />
            </div>
          </motion.div>

          <div className="mt-8 flex gap-3">
            <button
              type="button"
              onClick={handlePrev}
              aria-label="Previous review"
              className="group/button flex h-9 w-9 items-center justify-center rounded-full border border-border bg-paper transition-colors hover:bg-surface"
            >
              <IconArrowLeft className="h-5 w-5 text-ink transition-transform duration-300 group-hover/button:-translate-x-0.5" />
            </button>
            <button
              type="button"
              onClick={handleNext}
              aria-label="Next review"
              className="group/button flex h-9 w-9 items-center justify-center rounded-full border border-border bg-paper transition-colors hover:bg-surface"
            >
              <IconArrowRight className="h-5 w-5 text-ink transition-transform duration-300 group-hover/button:translate-x-0.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
