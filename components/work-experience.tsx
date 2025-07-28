import { Link } from "next-view-transitions";
import { H3 } from "@/components/ui/heading";
import { ExternalLinkIcon } from "lucide-react";

const workExperiences = [
  {
    title: "The Beauty of Earth",
    description:
      "A collection of landscape photography showcasing the beauty of Earth.",
    link: "https://thebeautyof.earth",
    isExternal: true,
    isNew: true,
  },
  {
    title: "Music Player",
    description: "A music player to play songs from my band Car Kids.",
    link: "https://radio.jomaendle.com",
    isExternal: true,
  },
  {
    title: "Jo Maendle Photography",
    description:
      "Personal photography portfolio showcasing portrait and landscape photography.",
    link: "https://photo.jomaendle.com",
    isExternal: true,
  },
  /*{
    title: "The Beauty of Earth (deprecated)",
    description:
      "A collection of landscape photography showcasing the beauty of Earth.",
    link: "https://images.jomaendle.com",
    isExternal: true,
  },*/
];

export function WorkExperience() {
  return (
    <>
      {workExperiences.map((experience, index) => (
        <article key={index}>
          <Link
            href={experience.link}
            className="group -mx-3 block rounded-[.25rem] px-3 py-2 transition-colors hover:bg-white/[0.03]"
            target="_blank"
            rel="noopener noreferrer"
          >
            <H3 className="flex items-center">
              {experience.title}
              {experience.isExternal && (
                <ExternalLinkIcon className="ml-2 inline-block size-3" />
              )}
              {experience.isNew && (
                <span className="ml-2 inline-block rounded-md border border-neutral-700 bg-neutral-800 px-2 py-1 text-xs font-semibold text-white">
                  New
                </span>
              )}
            </H3>
            <p className="text-muted-foreground">{experience.description}</p>
          </Link>
        </article>
      ))}
    </>
  );
}
