"use client";

import { useSyncExternalStore } from "react";

export interface TocItem {
  id: string;
  title: string;
  level: number;
}

// Generate slug from text (matching HeadingWithAnchor component)
function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

function getHeadingsSnapshot(): TocItem[] {
  if (typeof document === "undefined") return [];

  const headings = document.querySelectorAll(".prose h2, .prose h3");
  const items: TocItem[] = [];

  headings.forEach((heading, index) => {
    const title = heading.textContent || "";
    const id = heading.id || generateSlug(title) || `heading-${index}`;
    const level = parseInt(heading.tagName.charAt(1));

    // Ensure heading has the ID
    if (!heading.id) {
      heading.id = id;
    }

    items.push({ id, title, level });
  });

  return items;
}

function getServerSnapshot(): TocItem[] {
  return [];
}

function subscribeToHeadings(callback: () => void): () => void {
  // Use MutationObserver to detect when headings change
  const observer = new MutationObserver(callback);
  const proseElement = document.querySelector(".prose");

  if (proseElement) {
    observer.observe(proseElement, {
      childList: true,
      subtree: true,
    });
  }

  // Also trigger on initial mount
  callback();

  return () => observer.disconnect();
}

/**
 * React 18+ hook to subscribe to DOM headings using useSyncExternalStore.
 * This is the recommended pattern for subscribing to external data sources.
 */
export function useDomHeadings(): TocItem[] {
  return useSyncExternalStore(
    subscribeToHeadings,
    getHeadingsSnapshot,
    getServerSnapshot
  );
}
