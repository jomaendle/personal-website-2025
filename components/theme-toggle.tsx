"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
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
      {/* Both icons stay mounted, stacked in one grid cell; the active one
          scales and rotates in via a plain CSS transition. This replaced a
          framer-motion AnimatePresence pair, which was the only thing keeping
          framer in the critical bundle of every page. Same 300ms spin, minus
          the exit choreography nobody could see at this size. */}
      <span className="grid size-5 place-items-center [&>*]:col-start-1 [&>*]:row-start-1">
        <Moon
          aria-hidden="true"
          className={`h-5 w-5 transition-transform duration-300 ease-in-out motion-reduce:transition-none ${
            isDark ? "rotate-0 scale-100" : "-rotate-180 scale-0"
          }`}
        />
        <Sun
          aria-hidden="true"
          className={`h-5 w-5 transition-transform duration-300 ease-in-out motion-reduce:transition-none ${
            isDark ? "rotate-180 scale-0" : "rotate-0 scale-100"
          }`}
        />
      </span>
    </Button>
  );
}
