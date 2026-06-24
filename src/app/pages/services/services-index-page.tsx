import Image from "next/image";
import Link from "next/link";
import { NAV_SERVICE_ORDER, SERVICES_DATA } from "@/lib/services-data";

export default function ServicesIndexPage() {
  return (
    <main className="flex flex-1 flex-col bg-paper font-sans">
      <section
        className="border-b border-border bg-paper pt-28 pb-12 sm:pt-32 sm:pb-16 lg:pt-36 lg:pb-20"
        aria-labelledby="services-index-heading"
      >
        <div className="mx-auto max-w-6xl px-6 sm:px-10 lg:px-16">
          <p className="text-sm font-medium tracking-[0.08em] text-primary uppercase">
            Our services
          </p>
          <h1
            id="services-index-heading"
            className="mt-3 max-w-2xl text-[clamp(2rem,5vw,3.25rem)] leading-[1.1] font-semibold tracking-[-0.03em] text-ink text-balance"
          >
            Logistics built around you
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted sm:text-lg text-pretty">
            Removals, courier, furniture delivery, waste clearance, student moves
            and cargo freight in Aberdeen and across the UK. Choose a service to
            learn more or get a quote.
          </p>
        </div>
      </section>

      <section className="py-16 sm:py-20 lg:py-24" aria-label="Service listings">
        <div className="mx-auto grid max-w-6xl gap-6 px-6 sm:grid-cols-2 sm:px-10 lg:px-16">
          {NAV_SERVICE_ORDER.map((slug) => {
            const service = SERVICES_DATA[slug];

            return (
              <Link
                key={slug}
                href={`/services/${slug}`}
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
                    {service.subtitle}
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
