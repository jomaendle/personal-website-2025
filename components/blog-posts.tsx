"use client";
import { useState, useEffect, memo } from "react";
import { H3 } from "@/components/ui/heading";
import { Link } from "next-view-transitions";
import { ViewCounter } from "@/components/view-counter";
import { BLOG_POSTS } from "@/lib/state/blog";
import { categoryFor } from "@/lib/state/writing-categories";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/button";

/**
 * BlogPosts — Editorial design layer.
 *
 * All of the show-more / collapse / view-transition logic is preserved
 * verbatim; only the row presentation changes: hairline ledger rows (the
 * `ledger-row` margin rule in `app/editorial-theme.css`), a mono category
 * eyebrow, and a serif title that picks up the brand color on hover from
 * `H3`. Category comes from `lib/state/writing-categories.ts`.
 */

const MotionLink = motion.create(Link);

const BlogPostItem = memo(
  ({
    post,
    index,
    shouldShow,
    motionProps,
    animationDuration,
    getItemAnimationDelay,
  }: {
    post: (typeof BLOG_POSTS)[number];
    index: number;
    shouldShow: boolean;
    motionProps: { initial?: string; exit?: string };
    animationDuration: number;
    getItemAnimationDelay: (index: number) => number;
  }) => {
    if (!shouldShow) return null;

    const itemVariants = {
      initial: { opacity: 0, y: -10 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: 10 },
    };

    return (
      <motion.article
        key={post.slug}
        layout
        variants={itemVariants}
        animate="animate"
        transition={{
          duration: animationDuration,
          delay: getItemAnimationDelay(index),
          ease: "easeOut",
        }}
        style={{ viewTransitionName: `blog-card-${post.slug}` }}
        {...motionProps}
      >
        <MotionLink
          href={"/blog/" + post.slug}
          className="group flex items-center gap-4 border-b border-border px-3 py-4 ledger-row"
          prefetch={false}
        >
          <span className="hidden w-[96px] shrink-0 font-mono text-xs uppercase tracking-[0.05em] text-brand sm:block">
            {categoryFor(post.slug)}
          </span>
          <div className="flex-1">
            <H3
              className="line-clamp-2"
              style={{ viewTransitionName: `blog-title-${post.slug}` }}
            >
              {post.title}
            </H3>
            <p
              style={{ viewTransitionName: `blog-date-${post.slug}` }}
              className="mt-1 font-mono text-xs text-muted-foreground transition-colors"
            >
              {post.date}
            </p>
          </div>
          <span className="transition-colors group-hover:text-brand">
            <ViewCounter slug={post.slug} shouldIncrement={false} />
          </span>
        </MotionLink>
      </motion.article>
    );
  },
);

BlogPostItem.displayName = "BlogPostItem";

export function BlogPosts() {
  const [showAll, setShowAll] = useState(false);
  const [isCollapsing, setIsCollapsing] = useState(false);

  const displayedPosts =
    showAll || isCollapsing ? BLOG_POSTS : BLOG_POSTS.slice(0, 4);

  const STAGGER_DELAY = 0.04;
  const ANIMATION_DURATION = 0.25;

  const getExitAnimationDuration = () => {
    const itemsToRemove = BLOG_POSTS.length - 4;
    return ANIMATION_DURATION + (itemsToRemove - 1) * STAGGER_DELAY;
  };

  const handleToggle = () => {
    if (showAll) {
      setIsCollapsing(true);
      setShowAll(false);
    } else {
      setShowAll(true);
    }
  };

  useEffect(() => {
    if (isCollapsing) {
      const timeoutId = setTimeout(() => {
        setIsCollapsing(false);
      }, getExitAnimationDuration() * 200);
      return () => clearTimeout(timeoutId);
    }
    return undefined;
  }, [isCollapsing]);

  const getItemAnimationDelay = (index: number) => {
    if (showAll && !isCollapsing) {
      return index > 3 ? (index - 4) * STAGGER_DELAY : 0;
    }
    if (isCollapsing && index > 3) {
      const itemsToRemove = BLOG_POSTS.length - 4;
      const relativePosition = index - 4;
      const positionFromEnd = itemsToRemove - 1 - relativePosition;
      return positionFromEnd * STAGGER_DELAY;
    }
    return 0;
  };

  return (
    <motion.div layout className="-mx-3 flex flex-col">
      <AnimatePresence initial={false}>
        {displayedPosts.map((post, index) => {
          const shouldShow =
            index < 4 || showAll || (isCollapsing && index >= 4);

          const motionProps = {
            ...(index > 3 &&
              showAll &&
              !isCollapsing && { initial: "initial" }),
            ...(index > 3 && isCollapsing && { exit: "exit" }),
          };

          return (
            <BlogPostItem
              key={post.slug}
              post={post}
              index={index}
              shouldShow={shouldShow}
              motionProps={motionProps}
              animationDuration={ANIMATION_DURATION}
              getItemAnimationDelay={getItemAnimationDelay}
            />
          );
        })}
      </AnimatePresence>

      {BLOG_POSTS.length > 4 && (
        <motion.div
          layout
          className="mt-6 flex justify-center"
          transition={{ layout: { duration: ANIMATION_DURATION, ease: "easeInOut" } }}
        >
          <Button variant="outline" onClick={handleToggle} disabled={isCollapsing}>
            {showAll ? "Show Less" : "Show More"}
          </Button>
        </motion.div>
      )}
    </motion.div>
  );
}
