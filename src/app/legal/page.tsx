import { LegalPageLayout } from "@/components/legal/legal-page-layout";
import { LEGAL } from "@/lib/legal";
import { BUSINESS, buildSocialMetadata } from "@/lib/seo";

const LEGAL_TITLE = "Legal Notice";
const LEGAL_DESCRIPTION =
  "Company registration, contact details and regulatory information for Urbanmove Logistics Ltd.";

export const metadata = buildSocialMetadata({
  title: LEGAL_TITLE,
  description: LEGAL_DESCRIPTION,
  canonical: "/legal",
});

export default function LegalNoticePage() {
  return (
    <LegalPageLayout title={LEGAL_TITLE}>
      <section>
        <h2>Name of company</h2>
        <p>{LEGAL.companyName}</p>
      </section>

      <section>
        <h2>Registered office</h2>
        <p>
          {LEGAL.registeredOffice.line1}
          <br />
          {LEGAL.registeredOffice.line2}
          <br />
          {LEGAL.registeredOffice.postalCode}
        </p>
      </section>

      <section>
        <h2>Contact details</h2>
        <p>
          <a
            href={`tel:${BUSINESS.telephone}`}
            className="font-medium text-ink underline-offset-4 hover:underline"
          >
            {BUSINESS.telephoneDisplay}
          </a>
        </p>
      </section>

      <section>
        <h2>Business ID no.</h2>
        <p>{LEGAL.companyNumber}</p>
      </section>

      <section>
        <h2>VAT no.</h2>
        <p>{LEGAL.vatNumber}</p>
      </section>

      <section>
        <h2>Regulatory authority</h2>
        <p>{LEGAL.regulatoryText}</p>
      </section>
    </LegalPageLayout>
  );
}
