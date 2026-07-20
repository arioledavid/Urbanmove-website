"use client";

import { useId, useState, type ReactNode } from "react";
import Link from "next/link";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
} from "motion/react";
import { IconChevronDown } from "@tabler/icons-react";
import { SectionHeader } from "@/components/motion/section-header";
import {
  PageRevealItem,
  PageStagger,
} from "@/components/motion/page-reveal";
import {
  FADE_UP_SUBTLE,
  PREMIUM_EASE,
  QUICK_TRANSITION,
} from "@/components/motion/motion-config";
import { JsonLd } from "@/components/seo/json-ld";
import { QUOTE_HREF } from "@/components/layout/nav-config";
import { FAQ_ITEMS, type FaqItem } from "@/lib/faq-data";
import { cn } from "@/lib/utils";

const FAQ_CONTENT: Record<string, ReactNode> = {
  "book-service": (
    <p>
      Go to{" "}
      <Link
        href={QUOTE_HREF}
        className="font-medium text-primary underline-offset-4 transition-colors hover:text-primary-hover hover:underline"
      >
        Get a quote
      </Link>
      , then select the desired service, time, and manpower needed for your move,
      making the process quick and convenient.
    </p>
  ),
};

const PANEL_TRANSITION = {
  duration: 0.28,
  ease: PREMIUM_EASE,
} as const;

function getFaqJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ_ITEMS.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}

type FaqAccordionItemProps = {
  item: FaqItem;
  content: ReactNode;
};

function FaqAccordionItem({ item, content }: FaqAccordionItemProps) {
  const [open, setOpen] = useState(false);
  const reduceMotion = useReducedMotion();
  const panelId = useId();
  const buttonId = useId();

  return (
    <PageRevealItem variants={FADE_UP_SUBTLE}>
      <div
        className={cn(
          "border-b border-border transition-colors duration-200",
          open && "bg-paper/60",
        )}
      >
        <motion.button
          type="button"
          id={buttonId}
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen((value) => !value)}
          className="flex w-full min-h-14 cursor-pointer items-center justify-between gap-4 py-4 text-left outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
          whileTap={reduceMotion ? undefined : { scale: 0.995 }}
          transition={QUICK_TRANSITION}
        >
          <span
            className={cn(
              "text-base font-semibold tracking-tight text-balance sm:text-lg",
              "transition-colors duration-200",
              open ? "text-primary" : "text-ink",
            )}
          >
            {item.question}
          </span>
          <motion.span
            className={cn(
              "flex size-8 shrink-0 items-center justify-center rounded-full border border-border",
              "transition-colors duration-200",
              open
                ? "border-primary/25 bg-primary text-paper"
                : "bg-paper text-subtle",
            )}
            animate={reduceMotion ? undefined : { rotate: open ? 180 : 0 }}
            transition={{ duration: 0.4, ease: PREMIUM_EASE }}
            aria-hidden
          >
            <IconChevronDown className="size-4" />
          </motion.span>
        </motion.button>

        {reduceMotion ? (
          open ? (
            <div
              id={panelId}
              role="region"
              aria-labelledby={buttonId}
              className="pb-5 pr-12 text-base leading-relaxed text-muted text-pretty"
            >
              {content}
            </div>
          ) : null
        ) : (
          <AnimatePresence initial={false}>
            {open ? (
              <motion.div
                key="panel"
                id={panelId}
                role="region"
                aria-labelledby={buttonId}
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={PANEL_TRANSITION}
                className="overflow-hidden"
              >
                <motion.div
                  initial={{ y: -6, filter: "blur(4px)" }}
                  animate={{ y: 0, filter: "blur(0px)" }}
                  exit={{ y: -4, filter: "blur(4px)" }}
                  transition={PANEL_TRANSITION}
                  className="pb-5 pr-12 text-base leading-relaxed text-muted text-pretty"
                >
                  {content}
                </motion.div>
              </motion.div>
            ) : null}
          </AnimatePresence>
        )}
      </div>
    </PageRevealItem>
  );
}

type FaqSectionProps = {
  className?: string;
};

export function FaqSection({ className }: FaqSectionProps) {
  return (
    <section
      id="faq"
      className={cn("bg-surface py-16 sm:py-20 lg:py-24", className)}
      aria-labelledby="faq-heading"
    >
      <JsonLd data={getFaqJsonLd()} />

      <div className="mx-auto max-w-6xl px-6 sm:px-10 lg:px-16">
        <SectionHeader
          eyebrow="FAQ"
          title="Frequently Asked Questions"
          titleId="faq-heading"
          className="mb-10"
        />

        <PageStagger className="mx-auto max-w-3xl border-t border-border">
          {FAQ_ITEMS.map((item) => (
            <FaqAccordionItem
              key={item.id}
              item={item}
              content={FAQ_CONTENT[item.id] ?? <p>{item.answer}</p>}
            />
          ))}
        </PageStagger>
      </div>
    </section>
  );
}
