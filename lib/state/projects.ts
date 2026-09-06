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
  /**
   * Label for a project that is still online but no longer worked on, shown as
   * a small mono tag beside the title. Optional: omit it and nothing renders,
   * so an actively maintained project needs no extra field. Saying so beats
   * quietly delisting the project, which loses the work.
   */
  status?: string;
}

export const PROJECTS: Project[] = [
  {
    id: "youmightnotneed",
    title: "youmightnotneed",
    description:
      "Paste a package.json, find the CSS, HTML or Web API that replaces each dependency. Open source.",
    link: "https://youmightnotneed-web.vercel.app",
    isExternal: true,
  },
  {
    id: "beauty-of-earth",
    title: "The Beauty of Earth",
    description: "Landscape photography from wherever I've been.",
    link: "https://thebeautyof.earth",
    isExternal: true,
  },
  {
    id: "links",
    title: "Links Collection",
    description:
      "Links I want to be able to find again. Programming, design, productivity.",
    link: "https://links.jomaendle.com",
    isExternal: true,
  },
  {
    id: "music-player",
    title: "Music Player",
    description: "A player for songs from my band, Car Kids.",
    link: "https://radio.jomaendle.com",
    isExternal: true,
  },
  {
    id: "photography",
    title: "Jo Maendle Photography",
    description: "My portfolio. Portrait and landscape work.",
    link: "https://photo.jomaendle.com",
    isExternal: true,
    status: "Archived",
  },
];
