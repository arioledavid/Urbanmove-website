import { ServiceTemplate } from "./_components/service-template";
import type { ServiceData, ServiceSlug } from "@/lib/services-data";

type ServiceDetailPageProps = {
  slug: ServiceSlug;
  service: ServiceData;
};

export default function ServiceDetailPage({
  slug,
  service,
}: ServiceDetailPageProps) {
  return <ServiceTemplate slug={slug} service={service} />;
}
