"use client";

import { Link } from "next-view-transitions";
import { H3 } from "@/components/ui/heading";
import { ExternalLinkIcon } from "lucide-react";
import { motion } from "framer-motion";
import { PROJECTS } from "@/lib/state/projects";

/**
 * WorkExperience — Editorial design layer.
 *
 * Same export and entrance animation; data now comes from `lib/state/projects.ts`.
 * Presentation is a set of hairline "ledger" rows with an ink fill-on-hover
 * (text inverts to paper). The `!` overrides win over H3's own hover color.
 */

const MotionLink = motion.create(Link);

export function WorkExperience() {
  return (
    <div className="-mx-3 flex flex-col">
      {PROJECTS.map((experience, index) => (
        <motion.article
          key={experience.id}
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{
            duration: 0.4,
            ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number],
            delay: index * 0.05,
          }}
        >
          <MotionLink
            href={experience.link}
            className="ledger-row group block border-b border-border px-3 py-4"
            target="_blank"
            rel="noopener noreferrer"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <H3 className="flex flex-wrap items-center">
                  {experience.title}
                  {experience.isExternal && (
                    <ExternalLinkIcon className="ml-2 inline-block size-3 flex-shrink-0 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  )}
                </H3>
                <p className="mt-1 text-muted-foreground">
                  {experience.description}
                </p>
              </div>
              <span
                aria-hidden="true"
                className="mt-1 shrink-0 font-mono text-muted-foreground transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-brand"
              >
                ↗
              </span>
            </div>
            <span className="sr-only"> (opens in new window)</span>
          </MotionLink>
        </motion.article>
      ))}
    </div>
  );
}
