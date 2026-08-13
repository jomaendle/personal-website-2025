"use client";

import { AnimatePresence, m } from "framer-motion";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

export function BackToTop() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      const scrolledPast = window.scrollY > 400;
      // Hide again once the footer is reached. The button is fixed at
      // bottom-right, and at narrow widths that lands it on top of the footer's
      // legal links — it covered ~a third of "Datenschutz" and, being the
      // higher layer, swallowed the clicks. Anyone that far down does not need
      // a scroll-to-top affordance badly enough to lose a link for it.
      const nearBottom =
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 160;

      setIsVisible(scrolledPast && !nearBottom);
    };

    toggleVisibility();
    window.addEventListener("scroll", toggleVisibility, { passive: true });
    window.addEventListener("resize", toggleVisibility);

    return () => {
      window.removeEventListener("scroll", toggleVisibility);
      window.removeEventListener("resize", toggleVisibility);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <AnimatePresence>
      {isVisible ? (
        <m.div
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          transition={{ duration: 0.2 }}
          className="fixed right-8 bottom-8 z-50"
        >
          <Button
            onClick={scrollToTop}
            size="sm"
            variant="outline"
            className="group h-12 w-12 rounded-full border-border bg-background/80 p-0 shadow-lg backdrop-blur-sm transition-all duration-200 hover:bg-accent"
            aria-label="Back to top"
          >
            <m.svg
              className="h-5 w-5 text-muted-foreground group-hover:text-foreground"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              whileHover={{ y: -2 }}
              transition={{ duration: 0.2 }}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 10l7-7m0 0l7 7m-7-7v18"
              />
            </m.svg>
          </Button>
        </m.div>
      ) : null}
    </AnimatePresence>
  );
}
