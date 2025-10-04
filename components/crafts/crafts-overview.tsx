"use client";
import { useState } from "react";
import posterImg1 from "../../public/crafts/preview/html-details.webp";
import posterImg2 from "../../public/crafts/preview/mspot-subscribe-btn.webp";
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
  /*  {
    src: "/crafts/ai-chat-demo.mp4",
    title: "Conversational AI Chat",
    posterImg: posterAiChat,
    bgColor: "#0a0a0a",
  },*/
  /*{
    src: "/animated-sign-up-button/tease.mp4",
    posterImg: posterImg3,
    title: "Sign Up Button Animation",
    bgColor: "#060606",
    link: "/blog/animated-sign-up-button",
  },*/
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
  const displayedCrafts = showAll ? crafts : crafts.slice(0, 2);

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
        <motion.div className="w-full">
          <CraftsContainer title="Shimmer Effect">
            <LoadingGradient className="text-xl">Loading</LoadingGradient>
          </CraftsContainer>
        </motion.div>

        <motion.div className="w-full">
          <CounterCraft />
        </motion.div>

        <AnimatePresence>
          {displayedCrafts.map((craft, index) => (
            <motion.div key={craft.src} className="w-full">
              <CraftsContainer
                style={{ backgroundColor: craft.bgColor }}
                title={craft.title}
                className="overflow-hidden"
                link={craft.link}
              >
                <video
                  autoPlay
                  loop
                  muted
                  playsInline
                  height={craft.posterImg.height}
                  width={craft.posterImg.width}
                  poster={craft.posterImg.src}
                  className="h-full w-full max-w-[400px] md:max-w-none"
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
