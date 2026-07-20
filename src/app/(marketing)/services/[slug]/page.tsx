import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ServiceDetailPage from "@/app/(marketing)/pages/services/service-detail-page";
import { JsonLd } from "@/components/seo/json-ld";
import {
  getServiceBySlug,
  isServiceSlug,
  SERVICE_SLUGS,
  type ServiceSlug,
} from "@/lib/services-data";
import { buildServiceMetadata, getServiceJsonLd } from "@/lib/seo";

type ServicePageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return SERVICE_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: ServicePageProps): Promise<Metadata> {
  const { slug } = await params;
  const service = getServiceBySlug(slug);

  if (!service) {
    return {
      title: { absolute: "Service Not Found | Urbanmove Logistics" },
      robots: { index: false },
    };
  }

  return buildServiceMetadata(slug as ServiceSlug, service);
}

export default async function ServicePage({ params }: ServicePageProps) {
  const { slug } = await params;

  if (!isServiceSlug(slug)) {
    notFound();
  }

  const service = getServiceBySlug(slug);

  if (!service) {
    notFound();
  }

  const typedSlug = slug as ServiceSlug;

  return (
    <>
      <JsonLd data={getServiceJsonLd(typedSlug, service)} />
      <ServiceDetailPage slug={typedSlug} service={service} />
    </>
  );
}
