"use client";

import { useSyncExternalStore, useMemo } from "react";

const WORDS_PER_MINUTE = 225;

function calculateReadingTime(text: string): string {
  const words = text.trim().split(/\s+/).length;
  const minutes = Math.ceil(words / WORDS_PER_MINUTE);
  return `${minutes} min read`;
}

function getProseContentSnapshot(): string {
  if (typeof document === "undefined") return "";
  return document.querySelector(".prose")?.textContent || "";
}

function getServerSnapshot(): string {
  return "";
}

function subscribeToProseContent(callback: () => void): () => void {
  const observer = new MutationObserver(callback);
  const proseElement = document.querySelector(".prose");

  if (proseElement) {
    observer.observe(proseElement, {
      childList: true,
      subtree: true,
      characterData: true,
    });
  }

  return () => observer.disconnect();
}

/**
 * React 18+ hook to get reading time from DOM content using useSyncExternalStore.
 * Optionally accepts content prop to skip DOM reading.
 */
export function useReadingTime(content?: string): string {
  const domContent = useSyncExternalStore(
    subscribeToProseContent,
    getProseContentSnapshot,
    getServerSnapshot
  );

  return useMemo(() => {
    const textContent = content || domContent;
    if (!textContent) return "0 min read";
    return calculateReadingTime(textContent);
  }, [content, domContent]);
}

// Export the calculation function for use elsewhere
export { calculateReadingTime };
