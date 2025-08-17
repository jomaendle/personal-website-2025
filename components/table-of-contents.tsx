"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/button";

interface TocItem {
  id: string;
  title: string;
  level: number;
}

interface TableOfContentsProps {
  className?: string;
}

export function TableOfContents({ className = "" }: TableOfContentsProps) {
  const [tocItems, setTocItems] = useState<TocItem[]>([]);
  const [activeId, setActiveId] = useState<string>("");
  const [isVisible, setIsVisible] = useState(false);

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
    setIsVisible(items.length > 0);

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
  }, []);

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

  if (!isVisible || tocItems.length === 0) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.nav
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.3 }}
        className={`fixed right-4 top-[100px] hidden h-full max-w-[260px] flex-col xl:flex 2xl:max-w-[290px] ${className}`}
        style={{
          maxHeight: "calc(100svh - 200px)",
        }}
        aria-label="Table of contents"
      >
        <div className="flex h-full flex-col rounded-lg border border-border bg-card px-2 py-4">
          <h4 className="mb-3 text-sm font-medium text-foreground">
            On this page
          </h4>
          <ul className="flex h-full w-full flex-col space-y-2 overflow-y-auto overflow-x-hidden text-sm">
            {tocItems.map((item) => (
              <motion.li
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
                  className={`block w-full whitespace-pre-wrap rounded-md px-2 py-1 text-left transition-all duration-200 hover:bg-accent hover:text-accent-foreground ${item.level === 3 ? "ml-4 text-muted-foreground" : ""} ${
                    activeId === item.id
                      ? "border-l-2 border-primary bg-accent/50 font-medium text-primary"
                      : "text-muted-foreground"
                  } `}
                >
                  {item.title}
                </button>
              </motion.li>
            ))}
          </ul>
        </div>
      </motion.nav>
    </AnimatePresence>
  );
}

// Mobile version that uses collapsible for table of contents only
export function MobileTableOfContents() {
  const [tocItems, setTocItems] = useState<TocItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const headings = document.querySelectorAll(".prose h2, .prose h3");
    const items: TocItem[] = [];

    headings.forEach((heading, index) => {
      const id = heading.id || `heading-${index}`;
      const title = heading.textContent || "";
      const level = parseInt(heading.tagName.charAt(1));

      if (!heading.id) {
        heading.id = id;
      }

      items.push({ id, title, level });
    });

    setTocItems(items);
  }, []);

  const scrollToHeading = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 100;
      const elementPosition = element.offsetTop - offset;
      window.scrollTo({
        top: elementPosition,
        behavior: "smooth",
      });
      setIsOpen(false);
    }
  };

  if (tocItems.length === 0) {
    return null;
  }

  return (
    <div className="mb-6 xl:hidden">
      <Button
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full justify-between"
      >
        On This Page
        <motion.span
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          ↓
        </motion.span>
      </Button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="mt-3 rounded-lg border border-border bg-card p-4">
              <ul className="space-y-2 text-sm">
                {tocItems.map((item) => (
                  <li key={item.id}>
                    <button
                      onClick={() => scrollToHeading(item.id)}
                      className={`block w-full rounded-md px-2 py-1 text-left transition-colors hover:bg-accent hover:text-accent-foreground ${item.level === 3 ? "ml-4 text-muted-foreground" : "text-foreground"} `}
                    >
                      {item.title}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
