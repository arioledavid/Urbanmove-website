import { buildSocialMetadata } from "@/lib/seo";

export { default } from "../pages/about/about-page";

const ABOUT_TITLE = "About Us | Urban Move Logistics";
const ABOUT_DESCRIPTION =
  "Aberdeen removals, courier and waste clearance from a local insured team. Trusted by homes and businesses across Aberdeen and the UK.";

export const metadata = buildSocialMetadata({
  title: ABOUT_TITLE,
  description: ABOUT_DESCRIPTION,
  canonical: "/about",
  absoluteTitle: true,
});
