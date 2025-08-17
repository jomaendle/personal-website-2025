"use client";

import { useEffect, useMemo, useState } from "react";
import { useAtom } from "jotai";
import { H3 } from "@/components/ui/heading";
import { Link } from "next-view-transitions";
import { BLOG_POSTS } from "@/lib/state/blog";
import {
  sidebarMorePostsOpenAtom,
  sidebarOnThisPageOpenAtom,
  tocAutoExpandEnabledAtom,
} from "@/lib/state/sidebar";
import { AnimatePresence, motion } from "framer-motion";
import { Collapsible, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";

interface TocItem {
  id: string;
  title: string;
  level: number;
}

interface SidebarNavigationProps {
  currentSlug: string;
}

export function SidebarNavigation({ currentSlug }: SidebarNavigationProps) {
  const [tocItems, setTocItems] = useState<TocItem[]>([]);
  const [activeId, setActiveId] = useState<string>("");
  const [isMorePostsOpen, setIsMorePostsOpen] = useAtom(sidebarMorePostsOpenAtom);
  const [isOnThisPageOpen, setIsOnThisPageOpen] = useAtom(sidebarOnThisPageOpenAtom);
  const [tocAutoExpandEnabled, setTocAutoExpandEnabled] = useAtom(tocAutoExpandEnabledAtom);
  const [isMounted, setIsMounted] = useState(false);


  const currentBlogPosts = useMemo(() => {
    return BLOG_POSTS.filter((post) => post.slug !== currentSlug);
  }, [currentSlug]);

  // Handle mounting to prevent SSR/hydration mismatches
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // TOC logic from original TableOfContents component
  useEffect(() => {
    // Generate TOC from headings in the prose content
    const headings = document.querySelectorAll(".prose h2, .prose h3");
    const items: TocItem[] = [];

    headings.forEach((heading, index) => {
      const id = heading.id || `heading-${index}`;
      const title = heading.textContent || "";
      const level = parseInt(heading.tagName.charAt(1));

      // Add ID to heading if it doesn't have one
      if (!heading.id) {
        heading.id = id;
      }

      items.push({ id, title, level });
    });

    setTocItems(items);

    // Smart auto-expand logic for "On This Page" section
    // Only auto-expand if:
    // 1. TOC items exist
    // 2. Auto-expansion is still enabled (first-time behavior)
    // 3. Component has mounted (to ensure localStorage is loaded)
    if (items.length > 0 && tocAutoExpandEnabled && isMounted) {
      setIsOnThisPageOpen(true);
      // Disable auto-expansion after first use to respect user preference going forward
      setTocAutoExpandEnabled(false);
    }

    // Intersection Observer for active heading tracking
    const observerOptions = {
      rootMargin: "-80px 0px -80% 0px",
      threshold: 0,
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveId(entry.target.id);
        }
      });
    }, observerOptions);

    headings.forEach((heading) => observer.observe(heading));

    return () => observer.disconnect();
  }, [isMounted, tocAutoExpandEnabled, setIsOnThisPageOpen, setTocAutoExpandEnabled]);

  const scrollToHeading = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 100; // Account for sticky header
      const elementPosition = element.offsetTop - offset;
      window.scrollTo({
        top: elementPosition,
        behavior: "smooth",
      });
    }
  };

  // Handle manual TOC toggle - disable auto-expand when user manually interacts
  const handleTocToggle = (open: boolean) => {
    setIsOnThisPageOpen(open);
    // Disable auto-expand permanently when user manually toggles
    setTocAutoExpandEnabled(false);
  };

  // Don't render until mounted to prevent hydration mismatch
  if (!isMounted) {
    return null;
  }

  return (
    <motion.aside
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="flex h-full flex-col gap-4 overflow-hidden overflow-y-auto rounded-lg border border-border bg-card px-2 py-4 text-sm"
        style={{
          scrollbarGutter: "stable",
        }}
      >
      {/* On This Page Section */}
      {tocItems.length > 0 && (
        <Collapsible
          open={isOnThisPageOpen}
          onOpenChange={handleTocToggle}
          className="relative"
        >
          <CollapsibleTrigger className="sticky -top-4 flex w-full items-center justify-between rounded-md bg-card px-2 py-3 text-sm font-medium text-foreground transition-colors hover:bg-accent hover:text-accent-foreground">
            On This Page
            <ChevronDown
              className={`h-4 w-4 transition-transform duration-200 ${
                isOnThisPageOpen ? "rotate-180" : ""
              }`}
            />
          </CollapsibleTrigger>
          <AnimatePresence>
            {isOnThisPageOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="space-y-2 pt-2">
                  <div className="flex flex-col space-y-1">
                    {tocItems.map((item) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{
                          delay: tocItems.indexOf(item) * 0.05,
                          type: "tween",
                        }}
                        className="flex w-full items-center"
                      >
                        <button
                          onClick={() => scrollToHeading(item.id)}
                          className={`block w-full whitespace-pre-wrap rounded-md px-2 py-1 text-left transition-all duration-200 hover:bg-accent hover:text-accent-foreground ${
                            item.level === 3 ? "ml-4 text-muted-foreground" : ""
                          } ${
                            activeId === item.id
                              ? "border-l-2 border-primary bg-accent/50 font-medium text-primary"
                              : "text-muted-foreground"
                          }`}
                        >
                          {item.title}
                        </button>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </Collapsible>
      )}

      {/* More Posts Section */}
      <Collapsible open={isMorePostsOpen} onOpenChange={setIsMorePostsOpen}>
        <CollapsibleTrigger className="sticky -top-4 flex w-full items-center justify-between rounded-md bg-card px-2 py-3 text-sm font-medium text-foreground transition-colors hover:bg-accent hover:text-accent-foreground">
          More Posts
          <ChevronDown
            className={`h-4 w-4 transition-transform duration-200 ${
              isMorePostsOpen ? "rotate-180" : ""
            }`}
          />
        </CollapsibleTrigger>
        <AnimatePresence>
          {isMorePostsOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="space-y-2 pt-2">
                <div className="flex flex-col gap-3">
                  {currentBlogPosts.map((post, index) => (
                    <motion.article
                      key={index}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{
                        delay: index * 0.05,
                        type: "tween",
                      }}
                    >
                      <Link
                        href={"/blog/" + post.slug}
                        className="group block w-full rounded-lg border border-transparent p-3 transition-all duration-200 hover:border-border hover:bg-accent/50"
                        prefetch={false}
                      >
                        <H3 className="blog-title line-clamp-2 whitespace-pre-wrap text-sm font-medium text-foreground transition-colors duration-200 group-hover:text-primary">
                          {post.title}
                        </H3>
                        <div className="mt-1 flex items-center justify-between">
                          <p className="text-xs text-muted-foreground transition-colors duration-200 group-hover:text-muted-foreground/80">
                            {post.date}
                          </p>
                        </div>
                      </Link>
                    </motion.article>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Collapsible>
    </motion.aside>
  );
}
