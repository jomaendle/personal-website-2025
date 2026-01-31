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

// Module-level cache for the headings snapshot
// This is the key fix: useSyncExternalStore requires getSnapshot to return
// the same reference if data hasn't changed
let cachedHeadings: TocItem[] = [];

function extractHeadingsFromDOM(): TocItem[] {
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

// Deep equality check for TocItem arrays
function headingsEqual(a: TocItem[], b: TocItem[]): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    const itemA = a[i];
    const itemB = b[i];
    if (!itemA || !itemB) return false;
    if (
      itemA.id !== itemB.id ||
      itemA.title !== itemB.title ||
      itemA.level !== itemB.level
    ) {
      return false;
    }
  }
  return true;
}

function updateCachedHeadings(): void {
  const newHeadings = extractHeadingsFromDOM();
  // Only update cache if content actually changed (avoids unnecessary re-renders)
  if (!headingsEqual(cachedHeadings, newHeadings)) {
    cachedHeadings = newHeadings;
  }
}

function getHeadingsSnapshot(): TocItem[] {
  // Return cached value - this MUST return same reference if data unchanged
  return cachedHeadings;
}

function getServerSnapshot(): TocItem[] {
  return [];
}

function subscribeToHeadings(callback: () => void): () => void {
  // Update cache on initial subscription
  updateCachedHeadings();

  // Use MutationObserver to detect when headings change
  const observer = new MutationObserver(() => {
    updateCachedHeadings();
    callback();
  });

  const proseElement = document.querySelector(".prose");

  if (proseElement) {
    observer.observe(proseElement, {
      childList: true,
      subtree: true,
    });
  }

  // Trigger initial callback after cache is populated
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
