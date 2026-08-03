import { buildSocialMetadata } from "@/lib/seo";

export { default } from "../pages/about/about-page";

const ABOUT_TITLE =
  "About Us | Man and Van & Removals in Aberdeen | UrbanMove Removals Man and Van Cleaning Services Ltd";
const ABOUT_DESCRIPTION =
  "UrbanMove Removals Man and Van Cleaning Services Ltd is Aberdeen's trusted man and van and removal company for house removals, office relocations, clearance, courier and same-day transport across Aberdeen and the UK.";

export const metadata = buildSocialMetadata({
  title: ABOUT_TITLE,
  description: ABOUT_DESCRIPTION,
  canonical: "/about",
  absoluteTitle: true,
});
