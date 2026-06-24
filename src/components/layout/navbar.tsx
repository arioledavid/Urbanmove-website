"use client";

import { useEffect, useState } from "react";
import { LogoLink } from "@/components/brand/brand-logo";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  DesktopNav,
  MobileServiceLink,
  NavLink,
  QuoteButton,
} from "./nav-menu";
import { NAV_LINKS, SERVICE_LINKS } from "./nav-config";

function MenuIcon({ open }: { open: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      aria-hidden
      className="h-6 w-6"
    >
      {open ? (
        <path strokeLinecap="round" d="M6 6l12 12M18 6 6 18" />
      ) : (
        <path strokeLinecap="round" d="M4 7h16M4 12h16M4 17h16" />
      )}
    </svg>
  );
}

function MobileNav({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="pointer-events-auto fixed inset-0 top-18 z-40 lg:hidden">
      <button
        type="button"
        className="absolute inset-0 bg-ink/40 backdrop-blur-sm"
        aria-label="Close menu"
        onClick={onClose}
      />

      <div className="relative mx-4 mt-2 overflow-hidden rounded-2xl border border-border bg-paper shadow-xl">
        <nav className="flex flex-col p-4" aria-label="Mobile navigation">
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.href}
              href={link.href}
              onClick={onClose}
              className="w-fit"
            >
              {link.label}
            </NavLink>
          ))}

          <div className="mt-2 border-t border-border pt-4">
            <p className="px-3 pb-2 text-xs font-medium tracking-wide text-muted uppercase">
              Services
            </p>
            <NavLink href="/services" onClick={onClose} className="mb-1 w-fit">
              View all services
            </NavLink>
            {SERVICE_LINKS.map((item) => (
              <MobileServiceLink
                key={item.href}
                href={item.href}
                onClick={onClose}
              >
                {item.label}
              </MobileServiceLink>
            ))}
          </div>

          <div className="mt-4 border-t border-border pt-4">
            <QuoteButton className="w-full" onClick={onClose} />
          </div>
        </nav>
      </div>
    </div>
  );
}

export function Navbar() {
  const pathname = usePathname();
  const onHome = pathname === "/";
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const solidNav = !onHome || scrolled;

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!onHome) {
      setScrolled(false);
      return;
    }

    const onScroll = () => {
      setScrolled(window.scrollY > 0);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [onHome]);

  return (
    <header
      className={cn(
        onHome
          ? "pointer-events-none fixed top-0 left-0 z-50 w-full transition-[background-color,border-color] duration-300"
          : "sticky top-0 z-50 w-full border-b border-border bg-paper",
        solidNav && "border-b border-border bg-paper",
      )}
    >
      <div className="pointer-events-auto mx-auto grid w-full max-w-7xl grid-cols-[1fr_auto_1fr] items-center gap-4 px-4 py-4 sm:px-5 lg:px-6">
        <LogoLink
          variant={solidNav ? "dark" : "light"}
          className="h-16 w-auto justify-self-start sm:h-20 lg:h-22"
        />

        <div className="justify-self-center">
          <DesktopNav light={!solidNav} />
        </div>

        <div className="flex items-center justify-self-end gap-3">
          <QuoteButton className="hidden lg:inline-flex" />

          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-tertiary text-ink transition-colors duration-200 hover:bg-tertiary-hover lg:hidden"
            aria-expanded={mobileOpen}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            onClick={() => setMobileOpen((open) => !open)}
          >
            <MenuIcon open={mobileOpen} />
          </button>
        </div>
      </div>

      <MobileNav open={mobileOpen} onClose={() => setMobileOpen(false)} />
    </header>
  );
}
