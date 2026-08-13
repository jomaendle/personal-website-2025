"use client";

import { Link } from "next-view-transitions";
import { H3 } from "@/components/ui/heading";
import { ExternalLinkIcon } from "lucide-react";
import { m } from "framer-motion";
import { PROJECTS } from "@/lib/state/projects";

/**
 * WorkExperience — Editorial design layer.
 *
 * Same export and entrance animation; data now comes from `lib/state/projects.ts`.
 * Presentation is a set of hairline "ledger" rows — the `ledger-row` margin
 * rule in `app/editorial-theme.css` — where the serif title takes the brand
 * color on hover from `H3` and the arrow nudges up and to the right.
 */

const MotionLink = m.create(Link);

export function WorkExperience() {
  return (
    <div className="-mx-3 flex flex-col">
      {PROJECTS.map((experience, index) => (
        <m.article
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
                    <ExternalLinkIcon className="ml-2 inline-block size-3 flex-shrink-0 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  )}
                  {/* Muted, not brand: the tag is a caveat on the row, so it
                      must not compete with the title it qualifies. It sits
                      inside the H3 so the heading text carries the caveat for a
                      screen reader too, rather than stranding it in a sibling. */}
                  {experience.status && (
                    <span className="ml-2 inline-flex shrink-0 items-center rounded-[0.2rem] border border-border-strong px-1.5 py-0.5 font-mono text-[0.6rem] uppercase tracking-[0.12em] text-muted-foreground">
                      {experience.status}
                    </span>
                  )}
                </H3>
                <p className="mt-1 text-muted-foreground">
                  {experience.description}
                </p>
              </div>
              <span
                aria-hidden="true"
                className="mt-1 shrink-0 font-mono text-muted-foreground transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-brand"
              >
                ↗
              </span>
            </div>
            <span className="sr-only"> (opens in new window)</span>
          </MotionLink>
        </m.article>
      ))}
    </div>
  );
}
