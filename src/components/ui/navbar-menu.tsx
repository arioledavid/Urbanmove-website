"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useId } from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

const transition = {
  type: "spring" as const,
  mass: 0.5,
  damping: 11.5,
  stiffness: 100,
  restDelta: 0.001,
  restSpeed: 0.001,
};

type MenuProps = {
  setActive: (item: string | null) => void;
  active: string | null;
  children: React.ReactNode;
  light?: boolean;
  className?: string;
  "aria-label"?: string;
};

export function Menu({
  setActive,
  active,
  children,
  light = false,
  className,
  "aria-label": ariaLabel,
}: MenuProps) {
  useEffect(() => {
    if (!active) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setActive(null);
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [active, setActive]);

  return (
    <nav
      aria-label={ariaLabel}
      onMouseLeave={() => setActive(null)}
      className={cn(
        "relative flex items-center justify-center gap-4 rounded-full border px-6 py-3 shadow-lg",
        light
          ? "border-paper/20 bg-ink/15 shadow-ink/10 backdrop-blur-md"
          : "border-border bg-paper shadow-ink/5",
        className,
      )}
    >
      {children}
    </nav>
  );
}

type MenuItemProps = {
  setActive: (item: string | null) => void;
  active: string | null;
  item: string;
  children?: React.ReactNode;
  light?: boolean;
  isActive?: boolean;
};

export function MenuItem({
  setActive,
  active,
  item,
  children,
  light = false,
  isActive = false,
}: MenuItemProps) {
  const panelId = useId();
  const isOpen = active === item;

  return (
    <div
      className="relative flex items-center"
      onMouseEnter={() => setActive(item)}
      onFocusCapture={() => setActive(item)}
    >
      <motion.button
        type="button"
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-controls={panelId}
        transition={{ duration: 0.3 }}
        className={cn(
          "inline-flex cursor-pointer items-center rounded-full bg-transparent px-4 py-2 text-sm font-medium leading-none transition-colors duration-200",
          isActive
            ? "bg-primary text-paper hover:bg-primary-hover"
            : light
              ? "text-paper hover:opacity-90"
              : "text-ink hover:opacity-90",
        )}
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            setActive(null);
          }
        }}
      >
        {item}
      </motion.button>
      {active !== null && isOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.85, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={transition}
        >
          <div className="absolute top-[calc(100%+1.2rem)] left-1/2 -translate-x-1/2 pt-4">
            <motion.div
              transition={transition}
              layoutId="active"
              id={panelId}
              role="menu"
              className="overflow-hidden rounded-2xl border border-border bg-paper shadow-xl shadow-ink/10 backdrop-blur-sm"
            >
              <motion.div layout className="h-full w-max p-4">
                {children}
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </div>
  );
}

type ProductItemProps = {
  title: string;
  description: string;
  href: string;
  src: string;
};

export function ProductItem({
  title,
  description,
  href,
  src,
}: ProductItemProps) {
  return (
    <Link
      href={href}
      role="menuitem"
      className="flex gap-3 rounded-xl p-2 transition-colors hover:bg-surface"
    >
      <div className="relative h-[70px] w-[140px] shrink-0 overflow-hidden rounded-md shadow-md">
        <Image
          src={src}
          alt={title}
          fill
          className="object-cover"
          sizes="140px"
        />
      </div>
      <div>
        <h4 className="mb-1 text-base font-semibold text-ink">{title}</h4>
        <p className="max-w-40 text-sm leading-snug text-muted">{description}</p>
      </div>
    </Link>
  );
}

type HoveredLinkProps = React.ComponentProps<typeof Link> & {
  light?: boolean;
};

export function HoveredLink({
  children,
  className,
  light = false,
  ...rest
}: HoveredLinkProps) {
  return (
    <Link
      {...rest}
      className={cn(
        "inline-flex items-center text-sm font-medium leading-none transition-colors",
        light
          ? "text-paper/85 hover:text-paper"
          : "text-ink/80 hover:text-ink",
        className,
      )}
    >
      {children}
    </Link>
  );
}
