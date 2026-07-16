"use client";

import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { WobbleCard } from "@/components/ui/wobble-card";
import { cn } from "@/lib/utils";

type Feature = {
  title: string;
  body: string;
  containerClassName: string;
  span: string;
  bodyClassName?: string;
  theme?: "dark" | "light";
};

const FEATURES: Feature[] = [
  {
    title: "Complete Moving & Logistics Solutions for Homes and Businesses",
    body: "From house and office removals to man-and-van services, furniture assembly, student relocations, storage solutions, skip clearances, cargo partnerships, and reliable last-mile delivery, Urbanmove Logistics delivers seamless, professional services with local expertise and nationwide reach.",
    containerClassName: "bg-ink",
    bodyClassName: "max-w-2xl",
    span: "lg:col-span-2",
  },
  {
    title: "Precision-Driven Moving & Logistics Solutions",
    body: "Secure, well-timed, and professionally managed services spanning removals, storage, furniture assembly, and delivery. We handle every detail to keep your move on track.",
    containerClassName: "bg-primary",
    span: "lg:col-span-1",
  },
  {
    title: "Professional Handling You Can Trust",
    body: "From fragile household items to heavy cargo and full property clearances, we provide careful, fully insured handling across removals, storage coordination, and logistics services.",
    containerClassName: "bg-tertiary",
    span: "lg:col-span-1",
    theme: "light",
  },
];

export function FeaturesSection() {
  return (
    <section
      id="services"
      className="bg-paper py-16 sm:py-20 lg:py-24"
      aria-labelledby="features-heading"
    >
      <div className="mx-auto max-w-6xl px-6 sm:px-10 lg:px-16">
        <h2 id="features-heading" className="sr-only">
          Why Urbanmove
        </h2>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:items-stretch lg:gap-6">
          {FEATURES.map((feature, index) => (
            <ScrollReveal
              key={feature.title}
              delay={index * 0.08}
              className={cn(feature.span, "h-full")}
            >
              <WobbleCard
                containerClassName={cn(feature.containerClassName, "h-full")}
              >
                <h3
                  className={cn(
                    "text-xl font-semibold tracking-tight sm:text-2xl",
                    feature.theme === "light" ? "text-ink" : "text-paper",
                  )}
                >
                  {feature.title}
                </h3>
                <p
                  className={cn(
                    "mt-3 max-w-prose text-sm leading-relaxed sm:text-base",
                    feature.theme === "light"
                      ? "text-ink/80"
                      : "text-paper/85",
                    feature.bodyClassName,
                  )}
                >
                  {feature.body}
                </p>
              </WobbleCard>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
