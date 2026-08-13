"use client";
import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { CounterCraft } from "@/components/crafts/counter";
import { CraftsContainer } from "@/components/crafts/CraftsContainer";
import { AnimatePresence, m } from "framer-motion";
import { LoadingGradient } from "@/components/ui/loading-gradient";

// Lazy load heavy components
const Minimap = lazy(() =>
  import("@/components/crafts/Minimap").then((mod) => ({
    default: mod.Minimap,
  })),
);

// Lazy load poster images (only imported when needed)
const posterImg1 = {
  src: "/crafts/preview/html-details.webp",
  width: 800,
  height: 600,
};

const crafts: {
  src: string;
  link?: string;
  posterImg: { src: string; width: number; height: number };
  title: string;
  bgColor: string;
}[] = [
  {
    src: "/crafts/animetd-details-demo-website.mp4",
    posterImg: posterImg1,
    title: "Animating the HTML Details Element",
    bgColor: "#16181d",
  },
];

// Lightweight loading placeholder for Minimap
function MinimapSkeleton() {
  return (
    <m.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="flex size-full flex-col items-center justify-center"
    >
      <div className="h-6 w-3/4 animate-pulse rounded bg-gray-200 dark:bg-white/10"></div>
    </m.div>
  );
}

// Optimized video component with Intersection Observer
function LazyVideo({ craft }: { craft: (typeof crafts)[0] }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [shouldLoad, setShouldLoad] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // These clips loop for well over five seconds with no controls, so under
    // `prefers-reduced-motion` they stay on their poster frame (WCAG 2.2.2).
    // `MotionConfig reducedMotion="user"` covers framer-motion, not raw video.
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    // Use Intersection Observer to only load video when visible
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setShouldLoad(true);
            if (prefersReducedMotion) return;
            // Play video when visible
            video.play().catch(() => {
              // Autoplay may be blocked, that's okay
            });
          } else {
            // Pause video when not visible to save resources
            video.pause();
          }
        });
      },
      {
        rootMargin: "50px", // Start loading slightly before visible
        threshold: 0.1,
      },
    );

    observer.observe(video);

    return () => {
      observer.disconnect();
    };
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
      preload="metadata" // Only load metadata initially
    >
      {shouldLoad && <source src={craft.src} type="video/mp4" />}
    </video>
  );
}

export function CraftsOverview() {
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Intersection Observer for lazy loading entire crafts section
  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            // Once visible, we can disconnect as we don't need to re-render
            observer.disconnect();
          }
        });
      },
      {
        rootMargin: "100px", // Start loading before visible
        threshold: 0.01,
      },
    );

    observer.observe(container);

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <div ref={containerRef} className="flex flex-col gap-4">
      <style>
        {`
          .gradient-text {
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
          }
        `}
      </style>

      <div className="flex grid-cols-2 flex-col items-start gap-4 md:grid">
        {/* Minimap - lazy loaded */}
        <CraftsContainer className="relative col-span-2" title="Minimap">
          <AnimatePresence mode="wait">
            {isVisible ? (
              <Suspense fallback={<MinimapSkeleton />}>
                <m.div
                  key="minimap-content"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  className="size-full"
                >
                  <Minimap />
                </m.div>
              </Suspense>
            ) : (
              <MinimapSkeleton key="minimap-skeleton" />
            )}
          </AnimatePresence>
        </CraftsContainer>

        {/* LoadingGradient - only render when visible */}
        <div className="w-full">
          <CraftsContainer>
            <AnimatePresence mode="wait">
              {isVisible ? (
                <m.div
                  key="loading-gradient-content"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                >
                  <LoadingGradient className="text-xl">Loading</LoadingGradient>
                </m.div>
              ) : (
                <m.div
                  key="loading-gradient-skeleton"
                  initial={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="h-6 w-24 animate-pulse rounded bg-gray-200 dark:bg-white/10"
                />
              )}
            </AnimatePresence>
          </CraftsContainer>
        </div>

        {/* CounterCraft - only render when visible */}
        <div className="w-full">
          <AnimatePresence mode="wait">
            {isVisible ? (
              <m.div
                key="counter-content"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              >
                <CounterCraft />
              </m.div>
            ) : (
              <CraftsContainer key="counter-skeleton">
                <m.div
                  initial={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="h-6 w-16 animate-pulse rounded bg-gray-200 dark:bg-white/10"
                />
              </CraftsContainer>
            )}
          </AnimatePresence>
        </div>

        {/* Videos - lazy loaded with Intersection Observer */}
        <AnimatePresence>
          {isVisible &&
            crafts.map((craft, index) => (
              <m.div
                key={craft.src}
                className="w-full md:col-span-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{
                  duration: 0.4,
                  ease: "easeOut",
                  delay: index * 0.1,
                }}
              >
                <CraftsContainer
                  style={{ backgroundColor: craft.bgColor }}
                  className="overflow-hidden"
                >
                  <LazyVideo craft={craft} />
                </CraftsContainer>
              </m.div>
            ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
