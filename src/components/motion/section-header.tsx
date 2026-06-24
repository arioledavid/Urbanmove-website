"use client";

import { PageRevealItem, PageStagger } from "./page-reveal";
import { cn } from "@/lib/utils";

type SectionHeaderProps = {
  eyebrow: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  className?: string;
  titleId?: string;
};

export function SectionHeader({
  eyebrow,
  title,
  description,
  align = "left",
  className,
  titleId,
}: SectionHeaderProps) {
  const centered = align === "center";

  return (
    <PageStagger
      className={cn(
        "max-w-2xl",
        centered && "mx-auto text-center",
        className,
      )}
    >
      <PageRevealItem>
        <p className="text-sm font-medium tracking-[0.08em] text-primary uppercase">
          {eyebrow}
        </p>
      </PageRevealItem>
      <PageRevealItem>
        <h2
          id={titleId}
          className="mt-3 text-[clamp(1.75rem,4vw,2.5rem)] leading-tight font-semibold tracking-tight text-ink text-balance"
        >
          {title}
        </h2>
      </PageRevealItem>
      {description ? (
        <PageRevealItem>
          <p
            className={cn(
              "mt-4 text-base leading-relaxed text-muted sm:text-lg text-pretty",
              centered && "mx-auto max-w-xl",
            )}
          >
            {description}
          </p>
        </PageRevealItem>
      ) : null}
    </PageStagger>
  );
}
