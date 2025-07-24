"use client";
import { useCallback, useState } from "react";
import posterImg1 from "../../public/crafts/preview/html-details.webp";
import posterImg2 from "../../public/crafts/preview/mspot-subscribe-btn.webp";
import posterImg3 from "../../public/crafts/preview/animated-button.webp";
import posterAiChat from "../../public/crafts/preview/ai-chat.webp";
import { Loader2 } from "lucide-react";
import { CounterCraft } from "@/components/crafts/counter";
import { CraftsContainer } from "@/components/crafts/CraftsContainer";
import { Button } from "@/components/ui/button";
import { AnimatePresence, motion } from "framer-motion";

import { LoadingGradient } from "@/components/ui/loading-gradient";

const crafts: {
  src: string;
  link?: string;
  posterImg: { src: string; width: number; height: number };
  title: string;
  bgColor: string;
}[] = [
  {
    src: "/crafts/ai-chat-demo.mp4",
    title: "Conversational AI Chat",
    posterImg: posterAiChat,
    bgColor: "#0a0a0a",
  },
  {
    src: "/animated-sign-up-button/tease.mp4",
    posterImg: posterImg3,
    title: "Sign Up Button Animation",
    bgColor: "#060606",
    link: "/blog/animated-sign-up-button",
  },
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

export function CraftsOverview() {
  const [showAll, setShowAll] = useState(false);
  const [loadedVideos, setLoadedVideos] = useState<Set<string>>(new Set());
  const displayedCrafts = showAll ? crafts : crafts.slice(0, 2);

  const removeLoader = useCallback((craftSrc: string) => {
    setLoadedVideos((prev) => new Set(prev).add(craftSrc));
  }, []);

  const handleVideoRef = useCallback(
    (videoElement: HTMLVideoElement | null, craftSrc: string) => {
      if (videoElement && !loadedVideos.has(craftSrc)) {
        // Remove loader immediately when video element is created
        removeLoader(craftSrc);

        // Also set up multiple event listeners for backup
        const events = ["loadstart", "loadedmetadata", "loadeddata", "canplay"];
        events.forEach((event) => {
          videoElement.addEventListener(event, () => removeLoader(craftSrc), {
            once: true,
          });
        });
      }
    },
    [loadedVideos, removeLoader],
  );

  return (
    <motion.div className="flex flex-col gap-4" layout>
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
        <motion.div
          layout
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="w-full"
        >
          <CraftsContainer title="Shimmer Effect">
            <LoadingGradient className="text-xl">Loading</LoadingGradient>
          </CraftsContainer>
        </motion.div>

        <motion.div
          layout
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="w-full"
        >
          <CounterCraft />
        </motion.div>

        <AnimatePresence>
          {displayedCrafts.map((craft, index) => (
            <motion.div
              key={craft.src}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{
                duration: 0.3,
                delay: index * 0.1, // staggered animation
              }}
              className="w-full"
            >
              <CraftsContainer
                style={{ backgroundColor: craft.bgColor }}
                title={craft.title}
                link={craft.link}
              >
                {!loadedVideos.has(craft.src) && (
                  <div
                    id={`loader-${craft.src}`}
                    className="motion-preset-fade absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-sm"
                  >
                    <Loader2 className="absolute inset-0 m-auto h-8 w-8 animate-spin" />
                  </div>
                )}
                <video
                  ref={(el) => handleVideoRef(el, craft.src)}
                  autoPlay
                  loop
                  muted
                  playsInline
                  height={craft.posterImg.height}
                  width={craft.posterImg.width}
                  className="w-full max-w-[400px] md:max-w-none"
                  poster={craft.posterImg.src}
                  aria-label={craft.title}
                >
                  <source src={craft.src} type="video/mp4" />
                </video>
              </CraftsContainer>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {crafts.length > 2 && (
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
