import { buildSocialMetadata } from "@/lib/seo";

export { default } from "../pages/services/services-index-page";

const SERVICES_TITLE =
  "Our Services | Man and Van Removals & Logistics in Aberdeen | Urbanmove Logistics";
const SERVICES_DESCRIPTION =
  "Removals, man and van, storage, furniture delivery, waste clearance, student moves, cargo and same-day courier in Aberdeen with UK-wide coverage when you need it.";

export const metadata = buildSocialMetadata({
  title: SERVICES_TITLE,
  description: SERVICES_DESCRIPTION,
  canonical: "/services",
  absoluteTitle: true,
});
