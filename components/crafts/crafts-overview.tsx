"use client";
import { useState, useEffect, useRef, Suspense, lazy } from "react";
import { CounterCraft } from "@/components/crafts/counter";
import { CraftsContainer } from "@/components/crafts/CraftsContainer";
import { Button } from "@/components/ui/button";
import { AnimatePresence, motion } from "framer-motion";
import { LoadingGradient } from "@/components/ui/loading-gradient";

// Lazy load heavy components
const Minimap = lazy(() =>
  import("@/components/crafts/Minimap").then((mod) => ({ default: mod.Minimap }))
);

// Lazy load poster images (only imported when needed)
const posterImg1 = {
  src: "/crafts/preview/html-details.webp",
  width: 800,
  height: 600,
};

const posterImg2 = {
  src: "/crafts/preview/mspot-subscribe-btn.webp",
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
  {
    src: "/crafts/animated-button-demo.mp4",
    posterImg: posterImg2,
    title: "Subscribe Animation for Memberspot",
    bgColor: "#00010f",
  },
];

// Lightweight loading placeholder for Minimap
function MinimapSkeleton() {
  return (
    <div className="flex size-full flex-col items-center justify-center">
      <div className="h-6 w-3/4 animate-pulse rounded bg-white/10"></div>
    </div>
  );
}

// Optimized video component with Intersection Observer
function LazyVideo({
  craft,
}: {
  craft: (typeof crafts)[0];
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [shouldLoad, setShouldLoad] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Use Intersection Observer to only load video when visible
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setShouldLoad(true);
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
      }
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
      className="h-full w-full max-w-[400px] md:max-w-none"
      aria-label={craft.title}
      preload="metadata" // Only load metadata initially
    >
      {shouldLoad && <source src={craft.src} type="video/mp4" />}
    </video>
  );
}

export function CraftsOverview() {
  const [showAll, setShowAll] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const displayedCrafts = showAll ? crafts : crafts.slice(0, 2);

  // Intersection Observer for lazy loading entire crafts section
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

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
      }
    );

    observer.observe(container);

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <motion.div ref={containerRef} className="flex flex-col gap-4" layout>
      <style>
        {`
          .gradient-text {
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
          }
        `}
      </style>

      <motion.div
        layout
        className="flex grid-cols-2 flex-col items-start gap-4 md:grid"
      >
        {/* Minimap - lazy loaded */}
        <CraftsContainer className="relative col-span-2">
          {isVisible ? (
            <Suspense fallback={<MinimapSkeleton />}>
              <Minimap />
            </Suspense>
          ) : (
            <MinimapSkeleton />
          )}
        </CraftsContainer>

        {/* LoadingGradient - only render when visible */}
        <motion.div className="w-full">
          <CraftsContainer>
            {isVisible ? (
              <LoadingGradient className="text-xl">Loading</LoadingGradient>
            ) : (
              <div className="h-6 w-24 animate-pulse rounded bg-white/10"></div>
            )}
          </CraftsContainer>
        </motion.div>

        {/* CounterCraft - only render when visible */}
        <motion.div className="w-full">
          {isVisible ? (
            <CounterCraft />
          ) : (
            <CraftsContainer>
              <div className="h-6 w-16 animate-pulse rounded bg-white/10"></div>
            </CraftsContainer>
          )}
        </motion.div>

        {/* Videos - lazy loaded with Intersection Observer */}
        {isVisible && (
          <AnimatePresence>
            {displayedCrafts.map((craft) => (
              <motion.div
                key={craft.src}
                className="w-full"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              >
                <CraftsContainer
                  style={{ backgroundColor: craft.bgColor }}
                  className="overflow-hidden"
                >
                  <LazyVideo craft={craft} />
                </CraftsContainer>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </motion.div>

      {/* Show More/Less button */}
      {crafts.length > 2 && isVisible && (
        <motion.div
          layout="position"
          className="flex justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ layout: { duration: 0.3, ease: "easeInOut" } }}
        >
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => setShowAll(!showAll)}
          >
            {showAll ? "Show Less" : "Show More"}
          </Button>
        </motion.div>
      )}
    </motion.div>
  );
}
