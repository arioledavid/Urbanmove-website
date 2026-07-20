import { LegalPageLayout } from "@/components/legal/legal-page-layout";
import { BUSINESS, buildSocialMetadata } from "@/lib/seo";

const PRIVACY_TITLE = "Privacy Policy";
const PRIVACY_DESCRIPTION =
  "How Urbanmove Logistics Ltd collects, uses and protects your personal data under UK data protection law.";

export const metadata = buildSocialMetadata({
  title: PRIVACY_TITLE,
  description: PRIVACY_DESCRIPTION,
  canonical: "/privacy",
});

export default function PrivacyPage() {
  return (
    <LegalPageLayout title={PRIVACY_TITLE}>
      <section>
        <h2>Collected personal data</h2>
        <p>
          Urbanmove Logistics Ltd collects personal data such as names, contact
          details and enquiry information submitted through our website. We do
          not sell personal data and only share it securely where necessary to
          deliver our services or meet legal requirements.
        </p>
      </section>

      <section>
        <h2>Purpose of collecting data</h2>
        <p>
          We use this information to respond to enquiries, provide our courier
          and logistics services, manage our business operations and comply with
          legal obligations.
        </p>
        <p>
          You have rights under UK data protection law to access, correct or
          request deletion of your personal data.
        </p>
      </section>

      <section>
        <h2>Data controller</h2>
        <p>
          For privacy enquiries please contact us at{" "}
          <a
            href={`mailto:${BUSINESS.email}`}
            className="font-medium text-ink underline-offset-4 hover:underline"
          >
            {BUSINESS.email}
          </a>
          .
        </p>
      </section>
    </LegalPageLayout>
  );
}
