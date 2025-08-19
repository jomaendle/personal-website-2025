"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { useAnalytics } from "@/lib/useAnalytics";

interface SeriesNavigationProps {
  currentArticle: number;
}

const seriesArticles = [
  {
    id: 1,
    title: "Find Your AI Development Level",
    shortTitle: "Assessment",
    slug: "ai-development-assessment",
    description: "Complete assessment framework to identify your mastery level"
  },
  {
    id: 2,
    title: "The AI Developer's Tool Selection Matrix",
    shortTitle: "Tool Selection",
    slug: "ai-tool-selection-matrix",
    description: "End trial-and-error with data-driven tool recommendations"
  },
  {
    id: 3,
    title: "The 30-Day AI Development Transformation",
    shortTitle: "Implementation",
    slug: "30-day-transformation-guide",
    description: "Complete roadmap from assessment to measurable gains"
  },
  {
    id: 4,
    title: "Mastering AI Development Workflows",
    shortTitle: "Advanced Patterns",
    slug: "advanced-ai-workflows",
    description: "Advanced orchestration and team leadership frameworks"
  }
];

export function SeriesNavigation({ currentArticle }: SeriesNavigationProps) {
  const currentIndex = currentArticle - 1;
  const previousArticle = currentIndex > 0 ? seriesArticles[currentIndex - 1] : null;
  const nextArticle = currentIndex < seriesArticles.length - 1 ? seriesArticles[currentIndex + 1] : null;
  const { trackEvent } = useAnalytics();
  
  const getArticleName = (slug: string) => {
    const articleMap: Record<string, string> = {
      'ai-development-assessment': 'assessment',
      'ai-tool-selection-matrix': 'tool_selection',
      '30-day-transformation-guide': 'transformation_guide',
      'advanced-ai-workflows': 'advanced_workflows',
    };
    return articleMap[slug] || slug;
  };

  return (
    <div className="space-y-4 mb-8">
      {/* Series Context */}
      <div className="bg-muted/20 rounded-lg p-4 border border-border">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="outline" className="bg-background border-border">
                Part {currentArticle} of 4
              </Badge>
              <span className="text-sm text-muted-foreground">AI Development Mastery Series</span>
            </div>
            <Link 
              href="/blog/ai-development-mastery-series" 
              className="text-sm text-link hover:text-link/80"
              onClick={() => {
                trackEvent('series_navigation_used', {
                  from_article: getArticleName(seriesArticles[currentIndex]?.slug || ''),
                  to_article: 'series_overview',
                  navigation_type: 'series_nav'
                });
              }}
            >
              ← Back to Series Overview
            </Link>
          </div>
        </div>
      </div>

      {/* Article Progress */}
      <div className="grid grid-cols-4 gap-2">
        {seriesArticles.map((article) => (
          <div
            key={article.id}
            className={`p-2 rounded text-center text-xs transition-all ${
              article.id === currentArticle
                ? 'bg-primary text-primary-foreground'
                : article.id < currentArticle
                ? 'bg-link text-white border border-link'
                : 'bg-muted text-muted-foreground border border-border'
            }`}
          >
            <div className="font-medium">{article.id}</div>
            <div className="opacity-75">{article.shortTitle}</div>
          </div>
        ))}
      </div>

      {/* Navigation */}
      <div className="flex justify-between items-center">
        <div>
          {previousArticle && (
            <Link 
              href={`/blog/ai-development-mastery-series/${previousArticle.slug}`}
              onClick={() => {
                trackEvent('series_navigation_used', {
                  from_article: getArticleName(seriesArticles[currentIndex]?.slug || ''),
                  to_article: getArticleName(previousArticle.slug),
                  navigation_type: 'previous_button'
                });
              }}
            >
              <Button variant="outline" size="sm">
                ← {previousArticle.shortTitle}
              </Button>
            </Link>
          )}
        </div>
        <div>
          {nextArticle && (
            <Link 
              href={`/blog/ai-development-mastery-series/${nextArticle.slug}`}
              onClick={() => {
                trackEvent('series_navigation_used', {
                  from_article: getArticleName(seriesArticles[currentIndex]?.slug || ''),
                  to_article: getArticleName(nextArticle.slug),
                  navigation_type: 'next_button'
                });
              }}
            >
              <Button size="sm">
                {nextArticle.shortTitle} →
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}