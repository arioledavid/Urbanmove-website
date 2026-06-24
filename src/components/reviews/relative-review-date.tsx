"use client";

import { useEffect, useState } from "react";
import { formatRelativeReviewDate } from "@/lib/format-relative-date";
import { cn } from "@/lib/utils";

type RelativeReviewDateProps = {
  postedAt: string;
  className?: string;
};

export function RelativeReviewDate({
  postedAt,
  className,
}: RelativeReviewDateProps) {
  const [label, setLabel] = useState<string | null>(null);

  useEffect(() => {
    setLabel(formatRelativeReviewDate(postedAt));
  }, [postedAt]);

  return (
    <span className={cn(className)} suppressHydrationWarning aria-hidden={!label}>
      {label ?? "\u00a0"}
    </span>
  );
}
