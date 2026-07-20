"use client";

import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { AnimatedTestimonials } from "@/components/ui/animated-testimonials";
import { ReviewCardStack } from "@/components/ui/review-card-stack";
import { GoogleReviewsLabel } from "@/components/reviews/google-reviews-label";
import { REVIEWS } from "@/lib/reviews-data";

export function ReviewsSection() {
  return (
    <section
      id="reviews"
      className="bg-surface py-16 sm:py-20 lg:py-24"
      aria-labelledby="reviews-heading"
    >
      <div className="mx-auto max-w-6xl px-6 sm:px-10 lg:px-16">
        <ScrollReveal className="mb-10 max-w-2xl">
          <GoogleReviewsLabel id="reviews-heading" />
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

        <ScrollReveal className="mt-10 max-w-2xl">
          <p className="text-[clamp(1.25rem,2.5vw,1.875rem)] leading-tight font-semibold tracking-[-0.02em] text-ink">
            Trusted by customers across the UK
          </p>
        </ScrollReveal>
      </div>
    </section>
  );
}
