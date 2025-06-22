"use client";
import { useState } from "react";
import posterImg1 from "../../public/crafts/preview/html-details.webp";
import posterImg2 from "../../public/crafts/preview/mspot-subscribe-btn.webp";
import posterImg3 from "../../public/crafts/preview/animated-button.webp";
import { Loader2 } from "lucide-react";
import { CounterCraft } from "@/components/crafts/counter";
import { CraftsContainer } from "@/components/crafts/CraftsContainer";
import { Button } from "@/components/ui/button";
import { AnimatePresence, motion } from "framer-motion";

const crafts: {
  src: string;
  link?: string;
  posterImg: { src: string; width: number; height: number };
  title: string;
  bgColor: string;
}[] = [
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
  const displayedCrafts = showAll ? crafts : crafts.slice(0, 1);

  return (
    <motion.div className="flex flex-col gap-4" layout>
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
          <CounterCraft />
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
                <div
                  id={`loader-${craft.src}`}
                  className="motion-preset-fade absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-sm"
                >
                  <Loader2 className="absolute inset-0 m-auto h-8 w-8 animate-spin" />
                </div>
                <video
                  autoPlay
                  loop
                  muted
                  playsInline
                  height={craft.posterImg.height}
                  width={craft.posterImg.width}
                  className="w-full max-w-[400px] md:max-w-none"
                  poster={craft.posterImg.src}
                  aria-label={craft.title}
                  onLoadedData={() => {
                    document.getElementById(`loader-${craft.src}`)?.remove();
                  }}
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
