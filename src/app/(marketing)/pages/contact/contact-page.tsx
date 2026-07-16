import { ContactFormSection } from "./_components/contact-form-section";
import { ContactHeroSection } from "./_components/contact-hero-section";

type ContactPageProps = {
  serviceSlug?: string;
};

export default function ContactPage({ serviceSlug }: ContactPageProps) {
  return (
    <main className="flex flex-1 flex-col bg-paper font-sans">
      <ContactHeroSection />
      <ContactFormSection serviceSlug={serviceSlug} />
    </main>
  );
}
