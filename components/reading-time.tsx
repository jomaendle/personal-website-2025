"use client";

import { useReadingTime } from "@/lib/hooks";

interface ReadingTimeProps {
  content?: string;
  className?: string;
}

export function ReadingTime({ content, className = "" }: ReadingTimeProps) {
  const readingTime = useReadingTime(content);

  return (
    <span className={`text-sm text-muted-foreground ${className}`}>
      {readingTime}
    </span>
  );
}