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
    title: "UK Wide Infrastructure",
    body: "Seamless logistics coverage engineered for both high growth businesses and individual clients. Wherever you are, we bridge the gap between local precision and national reach.",
    containerClassName: "bg-ink",
    bodyClassName: "max-w-2xl",
    span: "lg:col-span-2",
  },
  {
    title: "Time Critical Dispatch",
    body: "Fast, secure, and meticulously scheduled. We track every mile to guarantee your cargo arrives exactly when expected.",
    containerClassName: "bg-primary",
    span: "lg:col-span-1",
  },
  {
    title: "Stress Free Handling",
    body: "From heavy cargo clearance to fragile residential removals, our team treats your assets with absolute care. Completely insured, thoroughly professional.",
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
          Why Urban Move
        </h2>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-6">
          {FEATURES.map((feature, index) => (
            <ScrollReveal
              key={feature.title}
              delay={index * 0.08}
              className={feature.span}
            >
              <WobbleCard containerClassName={feature.containerClassName}>
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
