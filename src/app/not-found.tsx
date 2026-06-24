import type { Metadata } from "next";
import Link from "next/link";
import { LogoLink } from "@/components/brand/brand-logo";

export const metadata: Metadata = {
  title: "Page Not Found",
  robots: {
    index: false,
    follow: true,
  },
};

export default function NotFound() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-24 text-center sm:px-10">
      <LogoLink className="mb-10 h-16 w-auto" />

      <p className="text-sm font-medium tracking-[0.14em] text-primary uppercase">
        404
      </p>
      <h1 className="mt-4 text-3xl font-semibold tracking-tight text-ink sm:text-4xl text-balance">
        Page not found
      </h1>
      <p className="mt-4 max-w-md text-base leading-relaxed text-muted text-pretty">
        The page you are looking for does not exist or may have been moved.
        Head back home or get in touch for a quote.
      </p>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/"
          className="inline-flex h-10 items-center justify-center rounded-full bg-primary px-5 text-sm font-medium text-paper transition-colors duration-200 hover:bg-primary-hover"
        >
          Back to home
        </Link>
        <Link
          href="/contact"
          className="inline-flex h-10 items-center justify-center rounded-full border border-border bg-paper px-5 text-sm font-medium text-ink transition-colors duration-200 hover:bg-surface"
        >
          Contact us
        </Link>
      </div>
    </main>
  );
}
