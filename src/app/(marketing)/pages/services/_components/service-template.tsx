"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "motion/react";
import { AnimatedDivider } from "@/components/motion/animated-divider";
import { HoverAccentCard } from "@/components/motion/hover-accent-card";
import { MagneticButton } from "@/components/motion/magnetic-button";
import {
  FADE_UP_SUBTLE,
  PREMIUM_EASE,
  SLIDE_IN_RIGHT,
} from "@/components/motion/motion-config";
import {
  PageReveal,
  PageRevealItem,
  PageStagger,
} from "@/components/motion/page-reveal";
import { SectionHeader } from "@/components/motion/section-header";
import {
  getServiceBookingHref,
  type ServiceData,
  type ServiceSlug,
} from "@/lib/services-data";
import { cn } from "@/lib/utils";

type ServiceTemplateProps = {
  slug: ServiceSlug;
  service: ServiceData;
};

function FeatureIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      aria-hidden
      className={cn("h-4 w-4 shrink-0 transition-colors duration-200", className)}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4 10.5 8 14.5 16 6.5"
      />
    </svg>
  );
}

function ProcessStep({
  step,
  index,
  total,
}: {
  step: ServiceData["steps"][number];
  index: number;
  total: number;
}) {
  const reduceMotion = useReducedMotion();
  const stepNumber = String(index + 1).padStart(2, "0");
  const isLast = index === total - 1;

  return (
    <PageRevealItem className="lg:flex-1" variants={FADE_UP_SUBTLE}>
      <div className="flex gap-5 lg:block">
        <div className="relative flex shrink-0 flex-col items-center lg:mb-6 lg:flex-row lg:items-center">
          <span className="relative z-10 flex h-10 w-10 items-center justify-center rounded-full border border-border bg-surface text-xs font-medium tracking-wider text-muted transition-colors duration-200 group-hover:border-primary/40 group-hover:text-primary">
            {stepNumber}
          </span>

          {!isLast ? (
            <>
              <span
                className="mt-3 h-full min-h-8 w-px bg-border lg:hidden"
                aria-hidden
              />
              <motion.span
                className="absolute top-5 left-[calc(50%+1.25rem)] hidden h-px origin-left bg-border lg:block"
                aria-hidden
                initial={reduceMotion ? false : { scaleX: 0 }}
                whileInView={reduceMotion ? undefined : { scaleX: 1 }}
                viewport={{ once: true, margin: "-8% 0px" }}
                transition={{
                  duration: 0.6,
                  ease: PREMIUM_EASE,
                  delay: index * 0.15 + 0.2,
                }}
                style={{ width: "calc(100% - 2.5rem)" }}
              />
            </>
          ) : null}
        </div>

        <HoverAccentCard as="div">
          <div className="p-6 sm:p-7">
            <h3 className="text-lg font-semibold tracking-tight text-ink">
              {step.title}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-muted sm:text-base text-pretty">
              {step.description}
            </p>
          </div>
        </HoverAccentCard>
      </div>
    </PageRevealItem>
  );
}

function FeatureCard({
  feature,
  index,
}: {
  feature: string;
  index: number;
}) {
  const spanClass =
    index === 0
      ? "md:col-span-2"
      : index === 3
        ? "md:col-span-2"
        : "";

  return (
    <PageRevealItem className={cn("list-none", spanClass)} variants={FADE_UP_SUBTLE}>
      <HoverAccentCard>
        <div className="flex items-start gap-4 p-6 sm:p-7">
          <span className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-full border border-border bg-surface text-muted transition-colors duration-200 group-hover:border-primary/40 group-hover:text-primary">
            <FeatureIcon />
          </span>
          <p className="text-base leading-relaxed text-ink/90 sm:text-[1.05rem] text-pretty">
            {feature}
          </p>
        </div>
      </HoverAccentCard>
    </PageRevealItem>
  );
}

export function ServiceTemplate({ slug, service }: ServiceTemplateProps) {
  const reduceMotion = useReducedMotion();
  const bookingHref = getServiceBookingHref(slug);

  return (
    <main className="flex flex-1 flex-col bg-paper font-sans">
      <section
        className="relative overflow-hidden bg-paper pt-28 pb-16 sm:pt-32 sm:pb-20 lg:pt-36 lg:pb-24"
        aria-labelledby="service-hero-heading"
      >
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(240,58,47,0.06),transparent_55%)]"
          aria-hidden
        />

        <div className="relative z-10 mx-auto grid max-w-6xl items-center gap-10 px-6 sm:px-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:gap-14 lg:px-16">
          <div>
            <PageStagger animateOnMount>
              <PageRevealItem>
                <p className="text-sm font-medium tracking-[0.14em] text-primary uppercase">
                  Service
                </p>
              </PageRevealItem>

              <PageRevealItem>
                <h1
                  id="service-hero-heading"
                  className="mt-4 text-[clamp(2.75rem,6vw,4.5rem)] leading-[1.05] font-semibold tracking-tight text-ink text-balance"
                >
                  {service.title}
                </h1>
              </PageRevealItem>

              <PageRevealItem>
                <p className="mt-5 text-xl leading-snug font-medium tracking-tight text-primary sm:text-2xl text-pretty">
                  {service.subtitle}
                </p>
              </PageRevealItem>

              <PageRevealItem>
                <div className="mt-6 max-w-2xl space-y-4">
                  <p className="text-base leading-relaxed text-muted sm:text-lg text-pretty">
                    {service.heroDescription}
                  </p>
                  {"heroHighlight" in service && service.heroHighlight ? (
                    <p className="text-xl font-bold tracking-tight text-primary sm:text-2xl lg:text-3xl text-pretty">
                      {service.heroHighlight}
                    </p>
                  ) : null}
                  {"heroDescriptionContinued" in service &&
                  service.heroDescriptionContinued ? (
                    <p className="text-base leading-relaxed text-muted sm:text-lg text-pretty">
                      {service.heroDescriptionContinued}
                    </p>
                  ) : null}
                </div>
              </PageRevealItem>

              <PageRevealItem>
                <AnimatedDivider className="mt-10" animateOnMount delay={0.55} />
              </PageRevealItem>
            </PageStagger>
          </div>

          <PageRevealItem variants={SLIDE_IN_RIGHT}>
            <motion.div
              className="relative aspect-[4/3] overflow-hidden rounded-3xl border border-border bg-surface shadow-sm"
              initial={reduceMotion ? false : { clipPath: "inset(0 0 100% 0)" }}
              whileInView={
                reduceMotion ? undefined : { clipPath: "inset(0 0 0 0)" }
              }
              viewport={{ once: true, margin: "-8% 0px" }}
              transition={{ duration: 0.75, ease: PREMIUM_EASE, delay: 0.15 }}
            >
              <Image
                src={service.image}
                alt={service.imageAlt}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 45vw"
                className="object-cover"
              />
              <div
                className="absolute inset-0 bg-linear-to-t from-ink/20 via-transparent to-transparent"
                aria-hidden
              />
            </motion.div>
          </PageRevealItem>
        </div>
      </section>

      <section
        className="border-t border-border bg-surface py-16 sm:py-20 lg:py-24"
        aria-labelledby="service-process-heading"
      >
        <div className="mx-auto max-w-6xl px-6 sm:px-10 lg:px-16">
          <SectionHeader
            eyebrow="How it works"
            title="From first contact to final handover"
            titleId="service-process-heading"
            className="mb-10"
          />

          <PageStagger className="flex flex-col gap-8 lg:flex-row lg:gap-5" grid>
            {service.steps.map((step, index) => (
              <ProcessStep
                key={step.title}
                step={step}
                index={index}
                total={service.steps.length}
              />
            ))}
          </PageStagger>
        </div>
      </section>

      <section
        className="border-t border-border bg-paper py-16 sm:py-20 lg:py-24"
        aria-labelledby="service-capabilities-heading"
      >
        <div className="mx-auto max-w-6xl px-6 sm:px-10 lg:px-16">
          <SectionHeader
            eyebrow={
              "featuresEyebrow" in service
                ? service.featuresEyebrow
                : "Capabilities"
            }
            title={
              "featuresTitle" in service
                ? service.featuresTitle
                : "Precision-built for your requirements"
            }
            titleId="service-capabilities-heading"
            className="mb-10"
          />

          <PageStagger className="grid gap-4 md:grid-cols-2 md:gap-5" grid>
            {service.features.map((feature, index) => (
              <FeatureCard key={feature} feature={feature} index={index} />
            ))}
          </PageStagger>

          {"featuresDescription" in service && service.featuresDescription ? (
            <PageReveal className="mt-10">
              <PageRevealItem>
                <p className="max-w-3xl text-base leading-relaxed text-muted sm:text-lg text-pretty">
                  {service.featuresDescription}
                </p>
              </PageRevealItem>
            </PageReveal>
          ) : null}
        </div>
      </section>

      {"whyChooseUs" in service && service.whyChooseUs ? (
        <section
          className="border-t border-border bg-surface py-16 sm:py-20 lg:py-24"
          aria-labelledby="service-why-choose-heading"
        >
          <div className="mx-auto max-w-6xl px-6 sm:px-10 lg:px-16">
            <SectionHeader
              eyebrow={
                "whyChooseUsEyebrow" in service
                  ? service.whyChooseUsEyebrow
                  : "Why us"
              }
              title={
                "whyChooseUsTitle" in service
                  ? service.whyChooseUsTitle
                  : "Why Choose Us?"
              }
              titleId="service-why-choose-heading"
              className="mb-10"
            />

            <PageStagger className="grid gap-4 md:grid-cols-2 md:gap-5" grid>
              {service.whyChooseUs.map((item, index) => (
                <FeatureCard key={item} feature={item} index={index} />
              ))}
            </PageStagger>
          </div>
        </section>
      ) : null}

      <section
        className="border-t border-border bg-surface py-20 sm:py-24 lg:py-28"
        aria-labelledby="service-cta-heading"
      >
        <div className="mx-auto max-w-6xl px-6 sm:px-10 lg:px-16">
          <PageReveal>
            <div className="relative overflow-hidden rounded-3xl border border-border bg-paper px-8 py-14 shadow-sm sm:px-12 sm:py-16 lg:px-16 lg:py-20">
              {!reduceMotion ? (
                <motion.div
                  className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(240,58,47,0.08),transparent_60%)]"
                  aria-hidden
                  animate={{ opacity: [0.6, 1, 0.6] }}
                  transition={{
                    duration: 6,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
              ) : (
                <div
                  className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(240,58,47,0.08),transparent_60%)]"
                  aria-hidden
                />
              )}

              <PageStagger className="relative z-10 mx-auto max-w-2xl text-center">
                <PageRevealItem>
                  <h2
                    id="service-cta-heading"
                    className="text-[clamp(1.75rem,4vw,2.75rem)] leading-tight font-semibold tracking-tight text-ink text-balance"
                  >
                    {"ctaTitle" in service
                      ? service.ctaTitle
                      : "Ready to move forward?"}
                  </h2>
                </PageRevealItem>

                <PageRevealItem>
                  <p className="mt-5 text-base leading-relaxed text-muted sm:text-lg text-pretty">
                    {"ctaDescription" in service
                      ? service.ctaDescription
                      : "Initialize your booking request and our team will coordinate every detail around your timeline."}
                  </p>
                </PageRevealItem>

                <PageRevealItem>
                  <div className="mt-10">
                    <MagneticButton href={bookingHref}>
                      {"ctaButtonLabel" in service
                        ? service.ctaButtonLabel
                        : "Initialize Booking Request"}
                    </MagneticButton>
                  </div>
                </PageRevealItem>
              </PageStagger>
            </div>
          </PageReveal>
        </div>
      </section>
    </main>
  );
}
