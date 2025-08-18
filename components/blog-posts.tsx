"use client";
import { useState } from "react";
import { H3 } from "@/components/ui/heading";
import { Link } from "next-view-transitions";
import { ViewCounterWithProvider } from "@/components/view-counter-provider";
import { BLOG_POSTS } from "@/lib/state/blog";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/button";

export function BlogPosts() {
  const [showAll, setShowAll] = useState(false);
  const [isCollapsing, setIsCollapsing] = useState(false);

  // Keep showing all posts during collapse animation
  const displayedPosts =
    showAll || isCollapsing ? BLOG_POSTS : BLOG_POSTS.slice(0, 4);

  const STAGGER_DELAY = 0.05;
  const ANIMATION_DURATION = 0.3;

  // Calculate total exit animation time for button coordination
  const getExitAnimationDuration = () => {
    const itemsToRemove = BLOG_POSTS.length - 4;
    return ANIMATION_DURATION + (itemsToRemove - 1) * STAGGER_DELAY;
  };

  const handleToggle = () => {
    if (showAll) {
      setIsCollapsing(true);
      setShowAll(false);
      // Reset collapsing state after animations complete
      setTimeout(() => {
        setIsCollapsing(false);
      }, getExitAnimationDuration() * 200);
    } else {
      setShowAll(true);
    }
  };

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

  const itemVariants = {
    initial: { opacity: 0, y: -20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 20 }, // Always exit downward for consistency
  };

  return (
    <motion.div layout className="flex flex-col gap-4">
      <AnimatePresence initial={false}>
        {displayedPosts.map((post, index) => {
          const shouldShow =
            index < 4 || showAll || (isCollapsing && index >= 4);

          if (!shouldShow) return null;

          const motionProps = {
            ...(index > 3 &&
              showAll &&
              !isCollapsing && { initial: "initial" }),
            ...(index > 3 && isCollapsing && { exit: "exit" }),
          };

          return (
            <motion.article
              key={post.slug}
              layout
              variants={itemVariants}
              animate="animate"
              transition={{
                duration: ANIMATION_DURATION,
                delay: getItemAnimationDelay(index),
                ease: "easeOut",
              }}
              {...motionProps}
            >
              <Link
                href={"/blog/" + post.slug}
                className="group -mx-3 flex items-center gap-4 rounded-[.25rem] px-3 py-2 transition-colors hover:bg-white/[0.03]"
                prefetch={false}
              >
                <div className="flex-1">
                  <H3 className="blog-title line-clamp-2">{post.title}</H3>
                  <p className="text-sm text-muted-foreground">{post.date}</p>
                </div>
                <ViewCounterWithProvider
                  slug={post.slug}
                  shouldIncrement={false}
                />
              </Link>
            </motion.article>
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
