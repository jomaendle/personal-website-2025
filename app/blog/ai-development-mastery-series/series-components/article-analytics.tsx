"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { useAnalytics, getArticleName, getArticleSlug } from "@/lib/useAnalytics";

interface ArticleAnalyticsProps {
  articleNumber: number;
  fromArticle?: string;
}

export function ArticleAnalytics({ articleNumber, fromArticle }: ArticleAnalyticsProps) {
  const pathname = usePathname();
  const { trackEvent } = useAnalytics();
  const [hasTrackedVisit, setHasTrackedVisit] = useState(false);
  const [hasTrackedCompletion, setHasTrackedCompletion] = useState(false);
  const [readingStartTime] = useState(Date.now());
  const scrollThreshold = useRef(0.8); // 80% scroll considered completion

  useEffect(() => {
    const articleSlug = getArticleSlug(pathname || '');
    const articleName = getArticleName(articleSlug);

    // Track article visit
    if (!hasTrackedVisit) {
      trackEvent('series_article_visited', {
        article: articleName,
        article_number: articleNumber,
        from_article: fromArticle
      });
      setHasTrackedVisit(true);
    }

    // Track scroll-based completion
    const handleScroll = () => {
      if (hasTrackedCompletion) return;

      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollTop = window.scrollY;
      const scrollPercent = (scrollTop + windowHeight) / documentHeight;

      if (scrollPercent >= scrollThreshold.current) {
        const readingTimeSeconds = Math.round((Date.now() - readingStartTime) / 1000);
        
        trackEvent('article_completion', {
          article: articleName,
          completion_method: 'scroll',
          reading_time_seconds: readingTimeSeconds
        });
        
        setHasTrackedCompletion(true);
      }
    };

    // Track time-based completion (minimum 3 minutes reading)
    const timeBasedCompletionTimer = setTimeout(() => {
      if (!hasTrackedCompletion) {
        const readingTimeSeconds = Math.round((Date.now() - readingStartTime) / 1000);
        
        // Only track time-based completion if user spent meaningful time
        if (readingTimeSeconds >= 180) { // 3 minutes
          trackEvent('article_completion', {
            article: articleName,
            completion_method: 'time_based',
            reading_time_seconds: readingTimeSeconds
          });
          
          setHasTrackedCompletion(true);
        }
      }
    }, 180000); // 3 minutes

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(timeBasedCompletionTimer);
    };
  }, [pathname, articleNumber, fromArticle, hasTrackedVisit, hasTrackedCompletion, readingStartTime, trackEvent]);

  // Track page unload for drop-off analysis
  useEffect(() => {
    const handleBeforeUnload = () => {
      const readingTimeSeconds = Math.round((Date.now() - readingStartTime) / 1000);
      const articleSlug = getArticleSlug(pathname || '');
      const articleName = getArticleName(articleSlug);

      // Track drop-off if user didn't complete the article
      if (!hasTrackedCompletion && readingTimeSeconds > 30) { // Only track if they spent at least 30 seconds
        // Track drop-off event
        trackEvent('series_drop_off', {
          last_article: articleName,
          articles_completed: articleNumber - 1
        });
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [pathname, hasTrackedCompletion, readingStartTime, articleNumber, trackEvent]);

  // This component renders nothing - it's purely for analytics
  return null;
}