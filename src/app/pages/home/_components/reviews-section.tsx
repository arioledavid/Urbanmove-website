"use client";

import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { AnimatedTestimonials } from "@/components/ui/animated-testimonials";
import { ReviewCardStack } from "@/components/ui/review-card-stack";
import { REVIEWS } from "@/lib/reviews-data";

export function ReviewsSection() {
  return (
    <section
      id="reviews"
      className="bg-surface py-16 sm:py-20 lg:py-24"
      aria-labelledby="reviews-heading"
    >
      <div className="mx-auto max-w-6xl px-6 sm:px-10 lg:px-16">
        <ScrollReveal className="mb-12 max-w-2xl lg:mb-12">
          <p className="text-sm font-medium tracking-[0.12em] text-muted uppercase">
            Google Reviews
          </p>
          <h2
            id="reviews-heading"
            className="mt-3 text-[clamp(1.75rem,4vw,2.5rem)] leading-tight font-semibold tracking-[-0.02em] text-ink"
          >
            Trusted by customers across the UK
          </h2>
        </ScrollReveal>

        <div className="hidden lg:block">
          <AnimatedTestimonials testimonials={REVIEWS} autoplay />
        </div>

        <ScrollReveal
          delay={0.1}
          className="flex justify-center pt-2 lg:hidden"
        >
          <ReviewCardStack reviews={REVIEWS} />
        </ScrollReveal>
      </div>
    </section>
  );
}
