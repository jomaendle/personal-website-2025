"use client";
import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { CraftsContainer } from "@/components/crafts/CraftsContainer";
import { CounterCraft } from "@/components/crafts/counter";
import { LoadingGradient } from "@/components/ui/loading-gradient";

// Code-split: Minimap is the one heavy craft.
const Minimap = lazy(() =>
  import("@/components/crafts/Minimap").then((mod) => ({
    default: mod.Minimap,
  })),
);

const crafts: {
  src: string;
  posterImg: { src: string; width: number; height: number };
  title: string;
  bgColor: string;
}[] = [
  {
    src: "/crafts/animetd-details-demo-website.mp4",
    posterImg: {
      src: "/crafts/preview/html-details.webp",
      width: 800,
      height: 600,
    },
    title: "Animating the HTML Details Element",
    bgColor: "#16181d",
  },
];

/** Poster paints immediately; the clip loads and plays only while on screen. */
function LazyVideo({ craft }: { craft: (typeof crafts)[0] }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [shouldLoad, setShouldLoad] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Loops longer than five seconds with no controls stay on their poster
    // under reduced motion (WCAG 2.2.2).
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setShouldLoad(true);
            if (prefersReducedMotion) continue;
            video.play().catch(() => {
              // Autoplay may be blocked; the poster stays.
            });
          } else {
            video.pause();
          }
        }
      },
      { rootMargin: "50px", threshold: 0.1 },
    );

    observer.observe(video);
    return () => observer.disconnect();
  }, []);

  return (
    <video
      ref={videoRef}
      loop
      muted
      playsInline
      height={craft.posterImg.height}
      width={craft.posterImg.width}
      poster={craft.posterImg.src}
      className="mx-auto h-full w-full max-w-[400px] md:max-w-[640px]"
      aria-label={craft.title}
      preload="metadata"
    >
      {shouldLoad ? <source src={craft.src} type="video/mp4" /> : null}
    </video>
  );
}

export function CraftsOverview() {
  return (
    <div className="flex grid-cols-2 flex-col items-start gap-4 md:grid">
      <CraftsContainer className="relative col-span-2" title="Minimap">
        <Suspense fallback={null}>
          <Minimap />
        </Suspense>
      </CraftsContainer>

      <div className="w-full">
        <CraftsContainer>
          <LoadingGradient className="text-xl">Loading</LoadingGradient>
        </CraftsContainer>
      </div>

      <div className="w-full">
        <CounterCraft />
      </div>

      {crafts.map((craft) => (
        <div key={craft.src} className="w-full md:col-span-2">
          <CraftsContainer
            style={{ backgroundColor: craft.bgColor }}
            className="overflow-hidden"
          >
            <LazyVideo craft={craft} />
          </CraftsContainer>
        </div>
      ))}
    </div>
  );
}
