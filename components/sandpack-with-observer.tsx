"use client";

import { useEffect, useRef, useState } from "react";
import { SandpackSkeleton } from "@/components/ui/skeleton";
import SandpackLazy from "./sandpack-lazy";

interface SandpackProps {
  files: Record<string, { code: string }>;
  template?: "vanilla" | "react" | "vue" | "angular" | "svelte" | "solid";
  theme?: "light" | "dark" | "auto";
  height?: string;
  showLineNumbers?: boolean;
  wrapContent?: boolean;
  showTabs?: boolean;
  showInlineErrors?: boolean;
  closableTabs?: boolean;
}

const SandpackWithObserver = (props: SandpackProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry?.isIntersecting && !hasLoaded) {
          setIsVisible(true);
          setHasLoaded(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: "200px 0px", // Load 200px before coming into view
        threshold: 0.1,
      }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [hasLoaded]);

  return (
    <div ref={ref} style={{ contain: "layout style paint" }}>
      {isVisible ? <SandpackLazy {...props} /> : <SandpackSkeleton />}
    </div>
  );
};

SandpackWithObserver.displayName = "SandpackWithObserver";

export default SandpackWithObserver;