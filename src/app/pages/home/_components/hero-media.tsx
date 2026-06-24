"use client";

import { useEffect, useRef, useState } from "react";

type HeroMediaProps = {
  videoSrc: string;
};

export function HeroMedia({ videoSrc }: HeroMediaProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updateMotion = () => setReduceMotion(motionQuery.matches);

    updateMotion();
    motionQuery.addEventListener("change", updateMotion);

    return () => motionQuery.removeEventListener("change", updateMotion);
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || reduceMotion) return;

    void video.play().catch(() => undefined);
  }, [reduceMotion, videoSrc]);

  return (
    <div className="absolute inset-0 overflow-hidden bg-paper">
      <video
        ref={videoRef}
        className="absolute inset-0 h-full w-full object-cover object-center"
        src={videoSrc}
        muted
        loop={!reduceMotion}
        playsInline
        autoPlay={!reduceMotion}
        preload="auto"
        aria-hidden
      />
    </div>
  );
}
