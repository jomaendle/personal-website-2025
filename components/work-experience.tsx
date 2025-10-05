import { Link } from "next-view-transitions";
import { H3 } from "@/components/ui/heading";
import { ExternalLinkIcon } from "lucide-react";

const workExperiences = [
  /*  {
    title: "OneClient",
    description:
      "A platform for freelancers and agencies to manage projects and clients.",
    link: "https://oneclient.pro",
    isExternal: true,
    isNew: true,
    imgSrc: oneClientImg,
  },*/
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
            className="group -mx-3 block rounded-[.25rem] px-3 py-2 hover-accent"
            target="_blank"
            rel="noopener noreferrer"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <H3 className="flex flex-wrap items-center">
                  {experience.title}
                  {experience.isExternal && (
                    <ExternalLinkIcon className="ml-2 inline-block size-3 flex-shrink-0" />
                  )}
                  {experience.isNew && (
                    <span className="ml-2 inline-block flex-shrink-0 rounded-md border border-neutral-700 bg-neutral-800 px-2 py-1 text-xs font-semibold text-white">
                      New
                    </span>
                  )}
                </H3>
                <p className="text-muted-foreground">
                  {experience.description}
                </p>
              </div>
            </div>
          </Link>
        </article>
      ))}
    </>
  );
}
