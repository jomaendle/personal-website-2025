import { Link } from "next-view-transitions";
import { H3 } from "@/components/ui/heading";
import { ExternalLinkIcon } from "lucide-react";

const workExperiences = [
  {
    title: "The Beauty of Earth",
    description:
      "A collection of landscape photography showcasing the beauty of Earth.",
    link: "https://images.jomaendle.com",
    isExternal: true,
  },
  {
    title: "ImmoKäpsele - Real Estate Agency",
    description:
      "A German real estate agency website with a focus on user experience and property listings.",
    link: "https://immokaepsele.de",
    isExternal: true,
  },
  {
    title: "Jo Maendle Photography",
    description:
      "Personal photography portfolio showcasing portrait and landscape photography.",
    link: "https://photo.jomaendle.com",
    isExternal: true,
  },
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
              {/*{experience.isNew && (
                <span className="ml-2 inline-block rounded border border-neutral-700 bg-gradient-to-t from-neutral-900 to-neutral-800 px-2 py-[1px] text-xs font-semibold text-white">
                  New
                </span>
              )}*/}
            </H3>
            <p className="text-muted-foreground">{experience.description}</p>
          </Link>
        </article>
      ))}
    </>
  );
}
