import Link from "next/link";
import {
  IconBrandInstagram,
  IconBrandTiktok,
  IconBrandWhatsapp,
} from "@tabler/icons-react";
import { LogoLink } from "@/components/brand/brand-logo";
import { NAV_LINKS, SERVICE_LINKS } from "@/components/layout/nav-config";
import { FOOTER_LEGAL_LINKS, SOCIAL_LINKS } from "@/lib/legal";
import { BUSINESS } from "@/lib/seo";

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
      className={className}
    >
      <path d="M12.24 10.285V13.2h5.52c-.24 1.26-.96 2.34-2.04 3.06v2.52h3.3c1.92-1.77 3.06-4.38 3.06-7.53 0-.69-.06-1.35-.18-1.965H12.24z" />
      <path d="M12 22c2.7 0 4.98-.9 6.66-2.46l-3.3-2.52c-.9.6-2.04.96-3.36.96-2.58 0-4.74-1.74-5.52-4.08H3.18v2.58C4.86 19.98 8.1 22 12 22z" />
      <path d="M6.48 13.92c-.18-.54-.3-1.14-.3-1.74s.12-1.2.3-1.74V7.86H3.18C2.46 9.42 2 11.16 2 13.02s.46 3.6 1.18 5.16l3.3-2.26z" />
      <path d="M12 5.38c1.44 0 2.76.48 3.78 1.44l2.82-2.82C16.98 2.34 14.7 1.5 12 1.5 8.1 1.5 4.86 3.52 3.18 6.84l3.3 2.26c.78-2.34 2.94-3.72 5.52-3.72z" />
    </svg>
  );
}

function SocialIcon({ label }: { label: string }) {
  const className = "h-5 w-5";

  switch (label) {
    case "Google Business Profile":
      return <GoogleIcon className={className} />;
    case "Instagram":
      return <IconBrandInstagram className={className} stroke={1.5} />;
    case "TikTok":
      return <IconBrandTiktok className={className} stroke={1.5} />;
    case "WhatsApp":
      return <IconBrandWhatsapp className={className} stroke={1.5} />;
    default:
      return null;
  }
}

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-border bg-surface">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-5 lg:px-6">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-5">
          <div className="sm:col-span-2 lg:col-span-1">
            <LogoLink className="h-14 w-auto" />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted text-pretty">
              Removals, Man and Van, Courier and Household Waste Clearance across Aberdeen and the UK.
            </p>
          </div>

          <div>
            <h2 className="text-sm font-semibold tracking-tight text-ink">
              Company
            </h2>
            <ul className="mt-4 space-y-2">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted transition-colors duration-200 hover:text-ink"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              {FOOTER_LEGAL_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted transition-colors duration-200 hover:text-ink"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="text-sm font-semibold tracking-tight text-ink">
              Services
            </h2>
            <ul className="mt-4 space-y-2">
              {SERVICE_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted/60 transition-colors duration-200 hover:text-ink"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="text-sm font-semibold tracking-tight text-ink">
              Contact
            </h2>
            <ul className="mt-4 space-y-3 text-sm text-muted">
              <li>
                <a
                  href={`tel:${BUSINESS.telephone}`}
                  className="transition-colors duration-200 hover:text-ink"
                >
                  {BUSINESS.telephoneDisplay}
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${BUSINESS.email}`}
                  className="transition-colors duration-200 hover:text-ink"
                >
                  {BUSINESS.email}
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-sm font-semibold tracking-tight text-ink">
              Follow us
            </h2>
            <ul className="mt-4 flex flex-wrap gap-2">
              {SOCIAL_LINKS.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={link.label}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-paper text-ink transition-colors duration-200 hover:border-primary/30 hover:text-primary"
                  >
                    <SocialIcon label={link.label} />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-2 border-t border-border pt-8 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {BUSINESS.name}. All rights reserved.
          </p>
          <p>Registered in Scotland · Company no. SC872412</p>
        </div>
      </div>
    </footer>
  );
}
