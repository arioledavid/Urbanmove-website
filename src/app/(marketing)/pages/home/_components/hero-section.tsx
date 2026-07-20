import { HeroContent } from "./hero-content";
import { HeroMedia } from "./hero-media";

const HERO_VIDEO = "/hero/live-hero.mp4";

export function HeroSection() {
  return (
    <section className="relative min-h-[min(92vh,900px)] w-full overflow-hidden">
      <HeroMedia videoSrc={HERO_VIDEO} />

      <div
        className="pointer-events-none absolute inset-0 bg-linear-to-r from-ink/75 via-ink/35 to-transparent"
        aria-hidden
      />

      <div className="relative z-10 mx-auto flex min-h-[min(92vh,900px)] w-full max-w-6xl flex-col justify-center px-6 pt-28 pb-20 sm:px-10 lg:px-16">
        <div className="w-full min-w-0">
          <HeroContent />
        </div>
      </div>
    </section>
  );
}
