"use client";
import { useState } from "react";
import { H2, H3 } from "@/components/ui/heading";
import { Link } from "next-view-transitions";
import { ViewCounterWithProvider } from "@/components/view-counter-provider";
import { BLOG_POSTS } from "@/lib/state/blog";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/button";

export function BlogPosts() {
  const [showAll, setShowAll] = useState(false);
  const displayedPosts = showAll ? BLOG_POSTS : BLOG_POSTS.slice(0, 4);

  return (
    <motion.div className="flex flex-col gap-4" layout>
      <AnimatePresence initial={false}>
        {displayedPosts.map((post, index) => (
          <motion.article
            key={post.slug}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{
              duration: 0.3,
              delay: index * 0.05, // subtle staggered animation
            }}
            layout
          >
            <Link
              href={"/blog/" + post.slug}
              className="group -mx-3 flex items-center gap-4 rounded-[.25rem] px-3 py-2 transition-colors hover:bg-white/[0.03]"
              prefetch={false}
            >
              <div className="flex-1">
                <H3 className="line-clamp-2">{post.title}</H3>
                <p className="text-sm text-muted-foreground">{post.date}</p>
              </div>
              <ViewCounterWithProvider
                slug={post.slug}
                shouldIncrement={false}
              />
            </Link>
          </motion.article>
        ))}
      </AnimatePresence>

      {BLOG_POSTS.length > 4 && (
        <motion.div
          layout
          className="mt-2 flex justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <Button variant="outline" onClick={() => setShowAll(!showAll)}>
            {showAll ? "Show Less" : "Show More"}
          </Button>
        </motion.div>
      )}
    </motion.div>
  );
}

export function BlogPostList({ currentSlug }: { currentSlug: string }) {
  return (
    <aside className="flex flex-col gap-6 text-sm">
      <H2 className="mb-0">More Posts</H2>

      <div className="flex flex-col gap-4">
        {BLOG_POSTS.filter((post) => post.slug !== currentSlug).map(
          (post, index) => (
            <article key={index}>
              <Link
                href={"/blog/" + post.slug}
                className="group flex items-center gap-4 transition-colors hover:text-neutral-400"
                prefetch={false}
              >
                <H3 className="line-clamp-2">{post.title}</H3>
              </Link>
            </article>
          ),
        )}
      </div>
    </aside>
  );
}
