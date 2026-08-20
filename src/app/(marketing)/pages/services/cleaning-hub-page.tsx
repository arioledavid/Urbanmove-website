import Image from "next/image";
import Link from "next/link";
import {
  CLEANING_HUB,
  CLEANING_NAV_ORDER,
  CLEANING_SERVICES,
} from "@/lib/cleaning-services-data";

export default function CleaningHubPage() {
  return (
    <main className="flex flex-1 flex-col bg-paper font-sans">
      <section
        className="border-b border-border bg-paper pt-28 pb-12 sm:pt-32 sm:pb-16 lg:pt-36 lg:pb-20"
        aria-labelledby="cleaning-hub-heading"
      >
        <div className="mx-auto max-w-6xl px-6 sm:px-10 lg:px-16">
          <p className="text-sm font-medium tracking-[0.08em] text-primary uppercase">
            Service category
          </p>
          <h1
            id="cleaning-hub-heading"
            className="mt-3 max-w-2xl text-[clamp(2rem,5vw,3.25rem)] leading-[1.1] font-semibold tracking-[-0.03em] text-ink text-balance"
          >
            {CLEANING_HUB.title}
          </h1>
          <p className="mt-5 max-w-2xl text-xl leading-snug font-medium tracking-tight text-primary sm:text-2xl text-pretty">
            {CLEANING_HUB.subtitle}
          </p>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted sm:text-lg text-pretty">
            {CLEANING_HUB.heroDescription}
          </p>
        </div>
      </section>

      <section className="py-16 sm:py-20 lg:py-24" aria-label="Cleaning services">
        <div className="mx-auto grid max-w-6xl gap-6 px-6 sm:grid-cols-2 sm:px-10 lg:px-16">
          {CLEANING_NAV_ORDER.map((slug) => {
            const service = CLEANING_SERVICES[slug];

            return (
              <Link
                key={slug}
                href={`/services/cleaning/${slug}`}
                className="group overflow-hidden rounded-2xl border border-border bg-surface transition-colors duration-200 hover:border-primary/30"
              >
                <div className="relative aspect-[16/9] overflow-hidden">
                  <Image
                    src={service.image}
                    alt={service.imageAlt}
                    fill
                    sizes="(max-width: 640px) 100vw, 50vw"
                    className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                  />
                  <div
                    className="absolute inset-0 bg-linear-to-t from-ink/30 via-transparent to-transparent"
                    aria-hidden
                  />
                </div>
                <div className="p-6">
                  <h2 className="text-lg font-semibold tracking-tight text-ink">
                    {service.title}
                  </h2>
                  <p className="mt-2 text-sm leading-relaxed text-muted text-pretty">
                    {service.navDescription}
                  </p>
                  <p className="mt-4 text-sm font-medium text-primary">
                    Learn more
                    <span aria-hidden> →</span>
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </main>
  );
}
