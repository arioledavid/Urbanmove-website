import { buildSocialMetadata } from "@/lib/seo";

export { default } from "../pages/about/about-page";

const ABOUT_TITLE = "About Us | Urban Move Logistics";
const ABOUT_DESCRIPTION =
  "Aberdeen removals, courier, furniture delivery and waste clearance from a local insured team. Homes and businesses across the city.";

export const metadata = buildSocialMetadata({
  title: ABOUT_TITLE,
  description: ABOUT_DESCRIPTION,
  canonical: "/about",
  absoluteTitle: true,
});
