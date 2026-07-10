import { buildSocialMetadata } from "@/lib/seo";

export { default } from "./pages/home/home-page";

const HOME_TITLE = "Removals, Courier & Waste Clearance in Aberdeen";
const HOME_DESCRIPTION =
  "House removals, same-day courier and waste clearance in Aberdeen. Get a free quote from Urbanmove Logistics today.";

export const metadata = buildSocialMetadata({
  title: HOME_TITLE,
  description: HOME_DESCRIPTION,
  canonical: "/",
});
