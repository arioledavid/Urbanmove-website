import CleaningHubPage from "@/app/(marketing)/pages/services/cleaning-hub-page";
import { JsonLd } from "@/components/seo/json-ld";
import {
  buildCleaningHubMetadata,
  getBreadcrumbJsonLd,
  getCleaningHubJsonLd,
} from "@/lib/seo";

export const metadata = buildCleaningHubMetadata();

export default function CleaningServicesPage() {
  return (
    <>
      <JsonLd data={getCleaningHubJsonLd()} />
      <JsonLd
        data={getBreadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Services", path: "/services" },
          { name: "Cleaning Services", path: "/services/cleaning" },
        ])}
      />
      <CleaningHubPage />
    </>
  );
}
