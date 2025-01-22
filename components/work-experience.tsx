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
            className="block group px-3 py-2 -mx-3 hover:bg-white/[0.03] rounded-[.25rem] transition-colors"
            target="_blank"
            rel="noopener noreferrer"
          >
            <H3 className="flex items-center">
              {experience.title}
              {experience.isExternal && (
                <ExternalLinkIcon className="inline-block size-3 ml-2" />
              )}
            </H3>
            <p className="text-muted-foreground ">{experience.description}</p>
          </Link>
        </article>
      ))}
    </>
  );
}
