import ContactPage from "../pages/contact/contact-page";
import { buildSocialMetadata } from "@/lib/seo";

const CONTACT_TITLE = "Contact Us | Get a Quote | Urbanmove Logistics";
const CONTACT_DESCRIPTION =
  "Free quote for removals, courier, furniture delivery or waste clearance in Aberdeen. Call or message our local team today.";

export const metadata = buildSocialMetadata({
  title: CONTACT_TITLE,
  description: CONTACT_DESCRIPTION,
  canonical: "/contact",
  absoluteTitle: true,
});

type ContactRouteProps = {
  searchParams: Promise<{ service?: string }>;
};

export default async function Page({ searchParams }: ContactRouteProps) {
  const { service } = await searchParams;
  return <ContactPage serviceSlug={service} />;
}
