"use client";

import { useEffect, useState } from "react";

interface ReadingTimeProps {
  content?: string;
  className?: string;
}

export function ReadingTime({ content, className = "" }: ReadingTimeProps) {
  const [readingTime, setReadingTime] = useState<string>("0 min read");

  useEffect(() => {
    // If content is provided, use it; otherwise get from page prose content
    const textContent = content || document.querySelector('.prose')?.textContent || '';
    
    if (textContent) {
      const time = calculateReadingTime(textContent);
      // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional: syncing with DOM content (external system)
      setReadingTime(time);
    }
  }, [content]);

  return (
    <span className={`text-sm text-muted-foreground ${className}`}>
      {readingTime}
    </span>
  );
}

export function calculateReadingTime(text: string): string {
  // Average reading speed: 200-250 words per minute
  // Using 225 as a middle ground
  const wordsPerMinute = 225;
  
  // Remove extra whitespace and count words
  const words = text.trim().split(/\s+/).length;
  
  // Calculate reading time in minutes
  const minutes = Math.ceil(words / wordsPerMinute);
  
  return `${minutes} min read`;
}

// Hook for getting reading time from current page content
export function useReadingTime() {
  const [readingTime, setReadingTime] = useState<string>("0 min read");

  useEffect(() => {
    const updateReadingTime = () => {
      const proseContent = document.querySelector('.prose');
      if (proseContent) {
        const text = proseContent.textContent || '';
        const time = calculateReadingTime(text);
        setReadingTime(time);
      }
    };

    // Initial calculation
    updateReadingTime();

    // Recalculate if content changes (useful for dynamic content)
    const observer = new MutationObserver(updateReadingTime);
    const proseElement = document.querySelector('.prose');
    
    if (proseElement) {
      observer.observe(proseElement, {
        childList: true,
        subtree: true,
        characterData: true
      });
    }

    return () => observer.disconnect();
  }, []);

  return readingTime;
}