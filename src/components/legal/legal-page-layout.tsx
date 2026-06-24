import Link from "next/link";

type LegalPageLayoutProps = {
  title: string;
  children: React.ReactNode;
};

export function LegalPageLayout({ title, children }: LegalPageLayoutProps) {
  return (
    <main className="flex flex-1 flex-col bg-paper font-sans">
      <div className="mx-auto w-full max-w-3xl px-6 py-28 sm:px-10 sm:py-32 lg:px-16 lg:py-36">
        <p className="text-sm font-medium tracking-[0.14em] text-primary uppercase">
          Legal
        </p>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-ink sm:text-4xl text-balance">
          {title}
        </h1>

        <div className="mt-10 space-y-8 text-base leading-relaxed text-ink/90 [&_h2]:mt-10 [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:tracking-tight [&_h2]:text-ink [&_h2:first-child]:mt-0 [&_p]:text-pretty">
          {children}
        </div>

        <p className="mt-12 border-t border-border pt-8 text-sm text-muted">
          <Link
            href="/contact"
            className="font-medium text-ink underline-offset-4 hover:underline"
          >
            Contact us
          </Link>{" "}
          if you have questions about this page.
        </p>
      </div>
    </main>
  );
}
