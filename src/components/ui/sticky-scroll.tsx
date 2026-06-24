"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import {
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
} from "motion/react";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { cn } from "@/lib/utils";

function useIsLargeScreen() {
  const [isLargeScreen, setIsLargeScreen] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 1024px)");
    const update = () => setIsLargeScreen(mediaQuery.matches);

    update();
    mediaQuery.addEventListener("change", update);
    return () => mediaQuery.removeEventListener("change", update);
  }, []);

  return isLargeScreen;
}

export type StickyScrollContentItem = {
  title: string;
  tagline: string;
  description: string;
  image: string;
  imageAlt: string;
};

function ServiceImage({ src, alt }: { src: string; alt: string }) {
  return (
    <Image
      src={src}
      alt={alt}
      fill
      className="object-cover"
      sizes="(max-width: 1024px) 288px, 320px"
    />
  );
}

function ServiceImageFrame({
  src,
  alt,
  className,
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative h-72 w-72 shrink-0 overflow-hidden rounded-2xl border border-border bg-paper sm:h-80 sm:w-80",
        className,
      )}
    >
      <ServiceImage src={src} alt={alt} />
    </div>
  );
}

function ServiceCopy({ item }: { item: StickyScrollContentItem }) {
  return (
    <div className="w-full">
      <h2 className="text-2xl font-semibold tracking-tight text-ink">
        {item.title}
      </h2>
      <p className="mt-3 text-sm font-medium text-primary">{item.tagline}</p>
      <p className="mt-4 max-w-lg text-base leading-relaxed text-ink/80">
        {item.description}
      </p>
    </div>
  );
}

type MobileServicesListProps = {
  content: StickyScrollContentItem[];
  className?: string;
};

function MobileServicesList({ content, className }: MobileServicesListProps) {
  return (
    <div
      aria-label="Services overview"
      className={cn("flex flex-col gap-16", className)}
    >
      {content.map((item, index) => (
        <ScrollReveal key={item.title} delay={index * 0.08}>
          <div className="flex flex-col items-center gap-6">
            <ServiceImageFrame src={item.image} alt={item.imageAlt} />
            <ServiceCopy item={item} />
          </div>
        </ScrollReveal>
      ))}
    </div>
  );
}

type DesktopStickyScrollProps = {
  content: StickyScrollContentItem[];
  contentClassName?: string;
  className?: string;
};

function DesktopStickyScroll({
  content,
  contentClassName,
  className,
}: DesktopStickyScrollProps) {
  const reduceMotion = useReducedMotion();
  const [activeCard, setActiveCard] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    container: ref,
    offset: ["start start", "end start"],
  });

  const cardLength = content.length;

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    const cardsBreakpoints = content.map((_, index) => index / cardLength);
    const closestBreakpointIndex = cardsBreakpoints.reduce(
      (acc, breakpoint, index) => {
        const distance = Math.abs(latest - breakpoint);
        if (distance < Math.abs(latest - cardsBreakpoints[acc])) {
          return index;
        }
        return acc;
      },
      0,
    );
    setActiveCard(closestBreakpointIndex);
  });

  const activeItem = content[activeCard];
  const isActive = (index: number) => activeCard === index;

  const itemMotion = (index: number) => ({
    opacity: reduceMotion || isActive(index) ? 1 : 0.4,
    filter: reduceMotion || isActive(index) ? "blur(0px)" : "blur(6px)",
  });

  return (
    <div
      ref={ref}
      aria-label="Services overview"
      className={cn(
        "relative flex h-[min(42rem,80vh)] flex-row justify-center gap-10 overflow-y-auto rounded-2xl border border-border bg-surface p-10",
        className,
      )}
    >
      <div className="relative flex flex-1 items-start px-4">
        <div className="w-full max-w-2xl">
          {content.map((item, index) => (
            <div
              key={item.title}
              className="flex min-h-[min(42rem,80vh)] flex-col items-start justify-center py-6"
            >
              <motion.div
                animate={itemMotion(index)}
                transition={{ duration: 0.35, ease: "easeOut" }}
                className="flex w-full flex-col items-start"
              >
                <ServiceCopy item={item} />
              </motion.div>
            </div>
          ))}
          <div className="min-h-[min(21rem,40vh)] shrink-0" aria-hidden />
        </div>
      </div>

      <div className="sticky top-0 h-[min(42rem,80vh)] w-80 shrink-0 self-start">
        <div className="flex h-full w-full items-center justify-center">
          <ServiceImageFrame
            src={activeItem.image}
            alt={activeItem.imageAlt}
            className={cn("h-80 w-80", contentClassName)}
          />
        </div>
      </div>
    </div>
  );
}

type StickyScrollProps = {
  content: StickyScrollContentItem[];
  contentClassName?: string;
};

export function StickyScroll({ content, contentClassName }: StickyScrollProps) {
  const isLargeScreen = useIsLargeScreen();

  if (isLargeScreen) {
    return (
      <DesktopStickyScroll
        content={content}
        contentClassName={contentClassName}
      />
    );
  }

  return <MobileServicesList content={content} />;
}
