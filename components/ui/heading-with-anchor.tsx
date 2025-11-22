"use client";

import { cn } from "@/lib/utils";
import { Link2 } from "lucide-react";
import { useCallback } from "react";

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
  // Extract text content for slug generation
  const textContent =
    typeof children === "string" ? children : children?.toString() || "";

  // Use provided id or generate from text
  const headingId = id || generateSlug(textContent);

  const copyToClipboard = useCallback(async () => {
    const url = `${window.location.origin}${window.location.pathname}#${headingId}`;
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = url;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
    }
  }, [headingId]);

  // Base styles for different heading levels (matching existing H2/H3 components)
  const getHeadingStyles = () => {
    if (level === 2) {
      return "text-sm font-[display] tracking-wider text-muted-foreground mb-4";
    }
    if (level === 3) {
      return "text-foreground font-extrabold group-hover:text-underline transition-colors";
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
        onClick={copyToClipboard}
        className="anchor-link ml-2 hidden items-center rounded-full opacity-0 transition-opacity duration-200 hover:opacity-100 group-hover:opacity-60 sm:inline-flex"
        aria-label={`Copy link to ${textContent}`}
        tabIndex={-1}
      >
        <Link2 className="h-4 w-4 text-muted-foreground" />
      </button>
    </h2>
  ) : (
    <h3 {...headingProps}>
      {children}
      <button
        onClick={copyToClipboard}
        className="anchor-link ml-2 hidden items-center rounded-full opacity-0 transition-opacity duration-200 hover:opacity-100 group-hover:opacity-60 sm:inline-flex"
        aria-label={`Copy link to ${textContent}`}
        tabIndex={-1}
      >
        <Link2 className="h-4 w-4 text-muted-foreground" />
      </button>
    </h3>
  );
}
