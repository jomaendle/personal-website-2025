"use client";

import { Link2 } from "lucide-react";
import { Children, isValidElement, useCallback } from "react";
import { cn } from "@/lib/utils";

/** Flatten heading children to text, so inline code and links still slug. */
function textOf(node: React.ReactNode): string {
  return Children.toArray(node)
    .map((child) => {
      if (typeof child === "string" || typeof child === "number") {
        return String(child);
      }
      if (isValidElement<{ children?: React.ReactNode }>(child)) {
        return textOf(child.props.children);
      }
      return "";
    })
    .join("");
}

// Generate slug from text (similar to GitHub's approach)
function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "") // Remove special characters except spaces and hyphens
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-") // Replace multiple hyphens with single
    .trim();
}

interface HeadingWithAnchorProps
  extends React.HTMLAttributes<HTMLHeadingElement> {
  level: 2 | 3;
  children: React.ReactNode;
}

export function HeadingWithAnchor({
  level,
  children,
  className,
  id,
  ...props
}: HeadingWithAnchorProps) {
  const textContent = textOf(children);
  const headingId = id || generateSlug(textContent);

  const copyToClipboard = useCallback(async () => {
    const url = `${window.location.origin}${window.location.pathname}#${headingId}`;
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      // Modern Clipboard API has 97%+ browser support
      // Silently fail on unsupported browsers
    }
  }, [headingId]);

  // Typography for these headings is owned by `.prose h2/h3` in globals.css
  // plus editorial-theme.css. Under Tailwind 3 this helper also carried
  // utility classes (text-sm, font-extrabold, …) that silently LOST to
  // `.prose h2` on specificity — dead code. Tailwind 4 puts utilities in a
  // native cascade layer that beats base styles regardless of specificity,
  // so those same classes suddenly applied and shrank every article heading.
  // Only the classes that were actually in effect remain.
  const getHeadingStyles = () => {
    if (level === 3) {
      return "transition-colors";
    }
    return "";
  };

  const headingProps = {
    id: headingId,
    className: cn("group relative", getHeadingStyles(), className),
    ...props,
  };

  return level === 2 ? (
    <h2 {...headingProps}>
      {children}
      <button
        type="button"
        onClick={copyToClipboard}
        className="anchor-link ml-2 hidden items-center rounded-full opacity-0 transition-opacity duration-200 hover:opacity-100 focus:opacity-100 focus-visible:opacity-100 group-hover:opacity-60 sm:inline-flex"
        aria-label={`Copy link to ${textContent}`}
      >
        <Link2 className="h-4 w-4 text-muted-foreground" />
      </button>
    </h2>
  ) : (
    <h3 {...headingProps}>
      {children}
      <button
        type="button"
        onClick={copyToClipboard}
        className="anchor-link ml-2 hidden items-center rounded-full opacity-0 transition-opacity duration-200 hover:opacity-100 focus:opacity-100 focus-visible:opacity-100 group-hover:opacity-60 sm:inline-flex"
        aria-label={`Copy link to ${textContent}`}
      >
        <Link2 className="h-4 w-4 text-muted-foreground" />
      </button>
    </h3>
  );
}
