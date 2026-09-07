/** Selected work on the homepage. */
export interface Project {
  id: string;
  title: string;
  description: string;
  link: string;
}

export const PROJECTS: Project[] = [
  {
    id: "youmightnotneed",
    title: "youmightnotneed",
    description:
      "Paste a package.json, find the CSS, HTML or Web API that replaces each dependency. Open source.",
    link: "https://youmightnotneed.dev/",
  },
  {
    id: "beauty-of-earth",
    title: "The Beauty of Earth",
    description: "Landscape photography from wherever I've been.",
    link: "https://thebeautyof.earth",
  },
  {
    id: "links",
    title: "Links Collection",
    description:
      "Links I want to be able to find again. Programming, design, productivity.",
    link: "https://links.jomaendle.com",
  },
  {
    id: "music-player",
    title: "Music Player",
    description: "A player for songs from my band, Car Kids.",
    link: "https://radio.jomaendle.com",
  },
];
