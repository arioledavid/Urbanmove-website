import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ServiceTemplate } from "@/app/(marketing)/pages/services/_components/service-template";
import { JsonLd } from "@/components/seo/json-ld";
import {
  CLEANING_HUB,
  CLEANING_SERVICE_SLUGS,
  getCleaningBookingHref,
  getCleaningServiceBySlug,
  isCleaningServiceSlug,
  type CleaningServiceSlug,
} from "@/lib/cleaning-services-data";
import {
  buildCleaningServiceMetadata,
  getBreadcrumbJsonLd,
  getCleaningServiceJsonLd,
} from "@/lib/seo";

type CleaningServicePageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return CLEANING_SERVICE_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: CleaningServicePageProps): Promise<Metadata> {
  const { slug } = await params;
  const service = getCleaningServiceBySlug(slug);

  if (!service) {
    return {
      title: {
        absolute:
          "Service Not Found | UrbanMove Removals Man and Van Cleaning Services Ltd",
      },
      robots: { index: false },
    };
  }

  return buildCleaningServiceMetadata(slug as CleaningServiceSlug, service);
}

export default async function CleaningServicePage({
  params,
}: CleaningServicePageProps) {
  const { slug } = await params;

  if (!isCleaningServiceSlug(slug)) {
    notFound();
  }

  const service = getCleaningServiceBySlug(slug);

  if (!service) {
    notFound();
  }

  const typedSlug = slug as CleaningServiceSlug;

  return (
    <>
      <JsonLd data={getCleaningServiceJsonLd(typedSlug, service)} />
      <JsonLd
        data={getBreadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Services", path: "/services" },
          { name: "Cleaning Services", path: CLEANING_HUB.href },
          {
            name: service.title,
            path: `/services/cleaning/${typedSlug}`,
          },
        ])}
      />
      <ServiceTemplate
        service={service}
        bookingHref={getCleaningBookingHref(typedSlug)}
      />
    </>
  );
}
