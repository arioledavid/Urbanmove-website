import { HeroSection } from "./_components/hero-section";
import { FeaturesSection } from "./_components/features-section";
import { ServicesSection } from "./_components/services-section";
import { ReviewsSection } from "./_components/reviews-section";

export default function HomePage() {
  return (
    <main className="flex flex-1 flex-col">
      <HeroSection />
      <ReviewsSection />
      <FeaturesSection />
      <ServicesSection />
    </main>
  );
}
