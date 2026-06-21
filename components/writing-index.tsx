"use client";

import { useMemo, useState } from "react";
import { Link } from "next-view-transitions";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { BLOG_POSTS } from "@/lib/state/blog";
import {
  WRITING_FILTERS,
  categoryFor,
  type WritingCategory,
} from "@/lib/state/writing-categories";

/**
 * WritingIndex — Editorial design layer.
 *
 * Interactive filterable list of all articles. Hairline ledger rows with an
 * ink fill-on-hover, a mono category eyebrow and serif titles. Reads the
 * canonical BLOG_POSTS and the additive category map — no data duplication.
 */

const MotionLink = motion.create(Link);

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
      <div className="flex flex-wrap gap-2">
        {WRITING_FILTERS.map((f) => {
          const active = filter === f;
          return (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={cn(
                "rounded-full border px-4 py-2 font-mono text-xs tracking-[0.04em] transition-colors",
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
          <motion.div
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
              className="group flex flex-col gap-1 border-b border-border px-3 py-5 transition-colors hover:bg-foreground sm:grid sm:grid-cols-[120px_1fr_120px] sm:items-baseline sm:gap-6"
            >
              <span className="font-mono text-xs uppercase tracking-[0.05em] text-brand">
                {post.category}
              </span>
              <span className="font-serif text-[clamp(1.25rem,2.4vw,1.7rem)] leading-[1.2] tracking-[-0.01em] text-foreground transition-colors group-hover:text-background">
                {post.title}
              </span>
              <span className="font-mono text-xs text-muted-foreground transition-colors group-hover:text-background/70 sm:justify-self-end">
                {post.date}
              </span>
            </MotionLink>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
