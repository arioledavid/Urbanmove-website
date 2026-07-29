import { FaqSection } from "@/components/faq/faq-section";
import { HeroSection } from "./_components/hero-section";
// import { FeaturesSection } from "./_components/features-section";
import { ServicesSection } from "./_components/services-section";
import { ReviewsSection } from "./_components/reviews-section";
import { VideoGallerySection } from "./_components/video-gallery/video-gallery-section";

export default function HomePage() {
  return (
    <main className="flex flex-1 flex-col">
      <HeroSection />
      <ReviewsSection />
      <VideoGallerySection />
      {/* <FeaturesSection /> */}
      <ServicesSection />
      <FaqSection />
    </main>
  );
}
