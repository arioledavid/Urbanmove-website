"use client";

import { InteractiveLogisticsPlanner } from "@/components/forms/interactive-logistics-planner";
import { SCALE_IN } from "@/components/motion/motion-config";
import { PageReveal, PageRevealItem } from "@/components/motion/page-reveal";
import { SectionHeader } from "@/components/motion/section-header";

type ContactFormSectionProps = {
  serviceSlug?: string;
};

export function ContactFormSection({ serviceSlug }: ContactFormSectionProps) {
  return (
    <section
      id="quote"
      className="bg-surface pt-16 pb-24 sm:pt-20 sm:pb-28 lg:pt-24 lg:pb-32"
      aria-labelledby="quote-form-heading"
    >
      <div className="mx-auto max-w-3xl px-6 sm:px-10 lg:px-16">
        <SectionHeader
          eyebrow="Get a quote"
          title="Tell us what you need moved"
          description="Select your service, share a few details, and we'll respond with a secure quote tailored to your timeline."
          titleId="quote-form-heading"
          align="center"
          className="mb-10 sm:mb-12"
        />

        <PageReveal delay={0.1}>
          <PageRevealItem variants={SCALE_IN}>
            <InteractiveLogisticsPlanner initialServiceSlug={serviceSlug} />
          </PageRevealItem>
        </PageReveal>
      </div>
    </section>
  );
}
