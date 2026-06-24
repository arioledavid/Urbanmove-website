"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  HoveredLink,
  Menu,
  MenuItem,
  ProductItem,
} from "@/components/ui/navbar-menu";
import { cn } from "@/lib/utils";
import { NAV_LINKS, QUOTE_HREF, SERVICE_LINKS } from "./nav-config";

function navPillClasses({
  isActive,
  light,
}: {
  isActive: boolean;
  light: boolean;
}) {
  return cn(
    "inline-flex items-center rounded-full px-4 py-2 text-sm font-medium transition-colors duration-200",
    isActive
      ? "bg-primary text-paper hover:bg-primary-hover"
      : light
        ? "text-paper/85 hover:bg-primary-hover hover:text-paper"
        : "text-ink/80 hover:bg-primary-hover hover:text-paper",
  );
}

function isPathActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

type NavLinkProps = {
  href: string;
  children: React.ReactNode;
  light?: boolean;
  className?: string;
  onClick?: () => void;
};

export function NavLink({
  href,
  children,
  light = false,
  className,
  onClick,
}: NavLinkProps) {
  const pathname = usePathname();
  const isActive = isPathActive(pathname, href);

  return (
    <Link
      href={href}
      onClick={onClick}
      aria-current={isActive ? "page" : undefined}
      className={cn(navPillClasses({ isActive, light }), className)}
    >
      {children}
    </Link>
  );
}

type QuoteButtonProps = {
  className?: string;
  onClick?: () => void;
};

export function QuoteButton({ className, onClick }: QuoteButtonProps) {
  return (
    <Link
      href={QUOTE_HREF}
      onClick={onClick}
      className={cn(
        "inline-flex h-10 items-center justify-center rounded-full bg-tertiary px-5 text-sm font-medium text-ink transition-colors duration-200 hover:bg-tertiary-hover",
        className,
      )}
    >
      Get a quote
    </Link>
  );
}

type DesktopNavProps = {
  light?: boolean;
};

export function DesktopNav({ light = false }: DesktopNavProps) {
  const [active, setActive] = useState<string | null>(null);
  const pathname = usePathname();
  const servicesActive = isPathActive(pathname, "/services");

  return (
    <div className="hidden lg:block">
      <Menu setActive={setActive} active={active} light={light} aria-label="Main navigation">
        {NAV_LINKS.map((link) => (
          <HoveredLink key={link.href} href={link.href} light={light}>
            {link.label}
          </HoveredLink>
        ))}
        <MenuItem
          setActive={setActive}
          active={active}
          item="Services"
          light={light}
          isActive={servicesActive}
        >
          <div className="flex flex-col gap-3">
            <Link
              href="/services"
              className="rounded-lg px-3 py-2 text-sm font-medium text-primary transition-colors duration-200 hover:bg-surface"
            >
              View all services →
            </Link>
            <div className="grid grid-cols-2 gap-2">
              {SERVICE_LINKS.map((service) => (
                <ProductItem
                  key={service.href}
                  title={service.label}
                  description={service.description}
                  href={service.href}
                  src={service.image}
                />
              ))}
            </div>
          </div>
        </MenuItem>
      </Menu>
    </div>
  );
}

export function MobileServiceLink({
  href,
  children,
  onClick,
}: {
  href: string;
  children: React.ReactNode;
  onClick?: () => void;
}) {
  const pathname = usePathname();
  const isActive = isPathActive(pathname, href);

  return (
    <Link
      href={href}
      onClick={onClick}
      aria-current={isActive ? "page" : undefined}
      className={cn(
        "block rounded-full px-4 py-2.5 text-sm transition-colors duration-200",
        isActive
          ? "bg-primary text-paper hover:bg-primary-hover"
          : "text-ink/85 hover:bg-primary-hover hover:text-paper",
      )}
    >
      {children}
    </Link>
  );
}
