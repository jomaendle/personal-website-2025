"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useIsMounted } from "@/lib/hooks";

export function ThemeToggle() {
  const { setTheme, resolvedTheme } = useTheme();
  const mounted = useIsMounted();

  const toggleTheme = () => {
    const newTheme = resolvedTheme === "dark" ? "light" : "dark";

    // Check for View Transitions API support and reduced motion preference
    if (
      !document.startViewTransition ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      setTheme(newTheme);
      return;
    }

    // Trigger smooth transition animation
    document.startViewTransition(() => {
      setTheme(newTheme);
    });
  };

  // Prevent hydration mismatch. The placeholder is a plain box rather than a
  // `disabled` Button: `disabled:opacity-50` would flash a dimmed sun on every
  // page until hydration, which reads as a broken control.
  if (!mounted) {
    return (
      <div
        aria-hidden="true"
        className="flex size-9 items-center justify-center text-foreground"
      >
        <Sun className="h-5 w-5" />
      </div>
    );
  }

  const isDark = resolvedTheme === "dark";

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      // The visual box stays 36px so the masthead keeps its weight; the
      // `after` pseudo-element extends the pointer target to 44px (WCAG 2.5.8).
      className="relative h-9 w-9 rounded-md transition-colors after:absolute after:left-1/2 after:top-1/2 after:size-11 after:-translate-x-1/2 after:-translate-y-1/2 after:content-[''] hover:bg-accent"
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      <AnimatePresence mode="wait" initial={false}>
        {isDark ? (
          <motion.div
            key="moon"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 180 }}
            transition={{
              duration: 0.3,
              ease: [0.4, 0, 0.2, 1] as [number, number, number, number],
            }}
          >
            <Moon className="h-5 w-5" />
          </motion.div>
        ) : (
          <motion.div
            key="sun"
            initial={{ scale: 0, rotate: 180 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: -180 }}
            transition={{
              duration: 0.3,
              ease: [0.4, 0, 0.2, 1] as [number, number, number, number],
            }}
          >
            <Sun className="h-5 w-5" />
          </motion.div>
        )}
      </AnimatePresence>
    </Button>
  );
}
