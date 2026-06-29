import { buildSocialMetadata } from "@/lib/seo";

export { default } from "../pages/services/services-index-page";

const SERVICES_TITLE = "Our Services | Urban Move Logistics";
const SERVICES_DESCRIPTION =
  "Removals, man and van, storage, furniture delivery, waste clearance, student moves, cargo freight and same-day courier in Aberdeen and across the UK.";

export const metadata = buildSocialMetadata({
  title: SERVICES_TITLE,
  description: SERVICES_DESCRIPTION,
  canonical: "/services",
  absoluteTitle: true,
});
