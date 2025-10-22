"use client";
import { useState, useEffect, memo } from "react";
import { H3 } from "@/components/ui/heading";
import { Link } from "next-view-transitions";
import { ViewCounter } from "@/components/view-counter";
import { BLOG_POSTS } from "@/lib/state/blog";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/button";

// Memoized blog post item to prevent unnecessary re-renders
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
    motionProps: any;
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
        <Link
          href={"/blog/" + post.slug}
          className="group -mx-3 flex items-center gap-4 rounded-[.25rem] px-3 py-2 hover-accent"
          prefetch={false}
        >
          <div className="flex-1">
            <H3
              className="blog-title line-clamp-2"
              style={{ viewTransitionName: `blog-title-${post.slug}` }}
            >
              {post.title}
            </H3>
            <p
              className="text-sm text-muted-foreground"
              style={{ viewTransitionName: `blog-date-${post.slug}` }}
            >
              {post.date}
            </p>
          </div>
          <ViewCounter slug={post.slug} shouldIncrement={false} />
        </Link>
      </motion.article>
    );
  },
);

BlogPostItem.displayName = "BlogPostItem";

export function BlogPosts() {
  const [showAll, setShowAll] = useState(false);
  const [isCollapsing, setIsCollapsing] = useState(false);

  // Keep showing all posts during collapse animation
  const displayedPosts =
    showAll || isCollapsing ? BLOG_POSTS : BLOG_POSTS.slice(0, 4);

  const STAGGER_DELAY = 0.04;
  const ANIMATION_DURATION = 0.25;

  // Calculate total exit animation time for button coordination
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

  // Handle cleanup of collapsing state with proper timeout cleanup
  useEffect(() => {
    if (isCollapsing) {
      // Reset collapsing state after animations complete
      const timeoutId = setTimeout(() => {
        setIsCollapsing(false);
      }, getExitAnimationDuration() * 200);

      // Cleanup timeout if component unmounts or state changes
      return () => clearTimeout(timeoutId);
    }
  }, [isCollapsing]);

  const getItemAnimationDelay = (index: number) => {
    // When expanding: stagger from top to bottom (only new items)
    if (showAll && !isCollapsing) {
      return index > 3 ? (index - 4) * STAGGER_DELAY : 0;
    }

    // When collapsing: stagger from bottom to top (items beyond index 3)
    if (isCollapsing && index > 3) {
      const itemsToRemove = BLOG_POSTS.length - 4;
      const relativePosition = index - 4; // Position among items to be removed (0-based)
      const positionFromEnd = itemsToRemove - 1 - relativePosition;
      return positionFromEnd * STAGGER_DELAY;
    }

    return 0;
  };

  return (
    <motion.div layout className="flex flex-col gap-4">
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
          className="mt-2 flex justify-center"
          transition={{
            layout: {
              duration: ANIMATION_DURATION,
              ease: "easeInOut",
            },
          }}
        >
          <Button
            variant="outline"
            onClick={handleToggle}
            disabled={isCollapsing}
          >
            {showAll ? "Show Less" : "Show More"}
          </Button>
        </motion.div>
      )}
    </motion.div>
  );
}
