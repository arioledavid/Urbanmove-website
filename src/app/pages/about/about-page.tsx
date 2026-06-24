import { AboutHeroSection } from "./_components/about-hero-section";
import { CtaBannerSection } from "./_components/cta-banner-section";
import { PillarsSection } from "./_components/pillars-section";
import { ValuesSection } from "./_components/values-section";

export default function AboutPage() {
  return (
    <main className="flex flex-1 flex-col bg-paper font-sans">
      <AboutHeroSection />
      <PillarsSection />
      <ValuesSection />
      <CtaBannerSection />
    </main>
  );
}
