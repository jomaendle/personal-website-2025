"use client";

import {
  useReadingTime as useReadingTimeHook,
  calculateReadingTime,
} from "@/lib/hooks";

interface ReadingTimeProps {
  content?: string;
  className?: string;
}

export function ReadingTime({ content, className = "" }: ReadingTimeProps) {
  const readingTime = useReadingTimeHook(content);

  return (
    <span className={`text-sm text-muted-foreground ${className}`}>
      {readingTime}
    </span>
  );
}

// Re-export for backwards compatibility
export { calculateReadingTime };

// Re-export hook for backwards compatibility
export { useReadingTimeHook as useReadingTime };