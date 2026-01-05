"use client";

import { Link } from "next-view-transitions";
import { H3 } from "@/components/ui/heading";
import { ExternalLinkIcon } from "lucide-react";
import { motion } from "framer-motion";

const workExperiences = [
  {
    id: "beauty-of-earth",
    title: "The Beauty of Earth",
    description:
      "A collection of landscape photography showcasing the beauty of Earth.",
    link: "https://thebeautyof.earth",
    isExternal: true,
  },
  {
    id: "links",
    title: "Links Collection",
    description:
      "A curated collection of useful links and resources on programming, design, and productivity.",
    link: "https://links.jomaendle.com",
    isExternal: true,
  },
  {
    id: "music-player",
    title: "Music Player",
    description: "A music player to play songs from my band Car Kids.",
    link: "https://radio.jomaendle.com",
    isExternal: true,
  },
  {
    id: "photography",
    title: "Jo Maendle Photography",
    description:
      "Personal photography portfolio showcasing portrait and landscape photography.",
    link: "https://photo.jomaendle.com",
    isExternal: true,
  },
];

const MotionLink = motion.create(Link);

export function WorkExperience() {
  return (
    <>
      {workExperiences.map((experience, index) => (
        <motion.article
          key={experience.id}
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{
            duration: 0.4,
            ease: [0.25, 0.1, 0.25, 1],
            delay: index * 0.05,
          }}
        >
          <MotionLink
            href={experience.link}
            className="hover-accent group -mx-3 block rounded-[.25rem] px-3 py-2"
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ y: -2 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <H3 className="flex flex-wrap items-center">
                  {experience.title}
                  {experience.isExternal && (
                    <ExternalLinkIcon className="ml-2 inline-block size-3 flex-shrink-0 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  )}
                </H3>
                <p className="text-muted-foreground">
                  {experience.description}
                </p>
              </div>
            </div>
          </MotionLink>
        </motion.article>
      ))}
    </>
  );
}
