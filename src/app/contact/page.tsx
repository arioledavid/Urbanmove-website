import ContactPage from "../pages/contact/contact-page";
import { buildSocialMetadata } from "@/lib/seo";

const CONTACT_TITLE = "Contact Us | Get a Quote | Urban Move Logistics";
const CONTACT_DESCRIPTION =
  "Request a free quote for removals, same-day courier or waste clearance in Aberdeen. Call or message Urban Move Logistics today.";

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
