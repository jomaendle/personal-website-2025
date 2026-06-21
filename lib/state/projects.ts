/**
 * Selected work / side projects.
 *
 * Extracted verbatim out of `components/work-experience.tsx` so the data and
 * its presentation are decoupled. Mirrors the `BLOG_POSTS` pattern.
 */

export interface Project {
  id: string;
  title: string;
  description: string;
  link: string;
  isExternal: boolean;
}

export const PROJECTS: Project[] = [
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
