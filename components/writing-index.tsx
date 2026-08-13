"use client";

import { m } from "framer-motion";
import { Link } from "next-view-transitions";
import { useMemo, useState } from "react";
import { H3 } from "@/components/ui/heading";
import { BLOG_POSTS } from "@/lib/state/blog";
import {
  categoryFor,
  WRITING_FILTERS,
  type WritingCategory,
} from "@/lib/state/writing-categories";
import { cn } from "@/lib/utils";

/**
 * WritingIndex — Editorial design layer.
 *
 * Interactive filterable list of all articles. Hairline ledger rows that pick
 * up a brand-tinted wash and a left rule on hover, a mono category eyebrow and
 * serif titles. Reads the canonical BLOG_POSTS and the additive category map,
 * so no post data is duplicated here.
 */

const MotionLink = m.create(Link);

export function WritingIndex() {
  const [filter, setFilter] = useState<"All" | WritingCategory>("All");

  const posts = useMemo(
    () =>
      BLOG_POSTS.map((p) => ({ ...p, category: categoryFor(p.slug) })).filter(
        (p) => filter === "All" || p.category === filter,
      ),
    [filter],
  );

  return (
    <div className="flex flex-col gap-8">
      {/* Filter chips */}
      {/* `gap-3` rather than `gap-2` so the 44px pseudo-element hit areas below
          (5px taller than the pill on each side) never overlap between rows. */}
      <div className="flex flex-wrap gap-3">
        {WRITING_FILTERS.map((f) => {
          const active = filter === f;
          return (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={cn(
                // The pill stays 34px tall; `after` pads the pointer target out
                // to 44px (WCAG 2.5.8) without changing the chip's weight.
                "relative rounded-full border px-4 py-2 font-mono text-xs tracking-[0.04em] transition-colors after:absolute after:inset-x-0 after:inset-y-[-5px] after:content-[''] focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                active
                  ? "border-foreground bg-foreground text-background"
                  : "border-border text-muted-foreground hover:border-foreground hover:text-foreground",
              )}
            >
              {f}
            </button>
          );
        })}
      </div>

      {/* Rows */}
      <div className="flex flex-col">
        {posts.map((post, index) => (
          <m.div
            key={post.slug}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.3,
              delay: index * 0.03,
              ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number],
            }}
          >
            <MotionLink
              href={`/blog/${post.slug}`}
              prefetch={false}
              className="ledger-row group flex flex-col gap-1 border-border border-b px-3 py-5 sm:grid sm:grid-cols-[120px_1fr_120px] sm:items-baseline sm:gap-6"
            >
              <span className="font-mono text-brand text-xs uppercase tracking-wider">
                {post.category}
              </span>
              {/* A heading, not a span: /blog renders this list rather than
                  BlogPosts, so without it the whole index is missing from the
                  screen-reader heading outline. `as="h2"` because these sit
                  directly under the page h1 — the homepage runs the same rows
                  under a section h2, where h3 is the correct depth. H3 supplies
                  the serif, tracking, colour and group-hover; only the fluid
                  size and leading are overridden. */}
              <H3
                as="h2"
                className="text-[clamp(1.25rem,2.4vw,1.7rem)] leading-[1.2]"
              >
                {post.title}
              </H3>
              <span className="font-mono text-muted-foreground text-xs transition-colors sm:justify-self-end">
                {post.date}
              </span>
            </MotionLink>
          </m.div>
        ))}
      </div>
    </div>
  );
}
