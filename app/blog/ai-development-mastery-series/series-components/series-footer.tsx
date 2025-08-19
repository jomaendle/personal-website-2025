"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useAnalytics } from "@/lib/useAnalytics";

interface SeriesFooterProps {
  currentArticle: number;
}

const seriesArticles = [
  {
    id: 1,
    title: "Find Your AI Development Level",
    description: "Complete assessment framework to identify your mastery level",
    slug: "ai-development-assessment"
  },
  {
    id: 2,
    title: "The AI Developer's Tool Selection Matrix",
    description: "End trial-and-error with data-driven tool recommendations",
    slug: "ai-tool-selection-matrix"
  },
  {
    id: 3,
    title: "The 30-Day AI Development Transformation",
    description: "Complete roadmap from assessment to measurable gains",
    slug: "30-day-transformation-guide"
  },
  {
    id: 4,
    title: "Mastering AI Development Workflows",
    description: "Advanced orchestration and team leadership frameworks",
    slug: "advanced-ai-workflows"
  }
];

export function SeriesFooter({ currentArticle }: SeriesFooterProps) {
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
    <div className="space-y-6 mt-12 pt-8 border-t">
      {/* Series Progress */}
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2">
          🎯 AI Development Mastery Series Progress
        </h3>
        <div className="flex justify-center items-center gap-2 mb-4">
          {seriesArticles.map((article) => (
            <div
              key={article.id}
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                article.id < currentArticle
                  ? 'bg-link text-white'
                  : article.id === currentArticle
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              {article.id}
            </div>
          ))}
        </div>
        <p className="text-sm text-muted-foreground">
          Article {currentArticle} of {seriesArticles.length} complete
        </p>
      </div>

      {/* Navigation */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Previous Article */}
        {previousArticle ? (
          <Link 
            href={`/blog/ai-development-mastery-series/${previousArticle.slug}`}
            onClick={() => {
              trackEvent('series_navigation_used', {
                from_article: getArticleName(seriesArticles[currentIndex]?.slug || ''),
                to_article: getArticleName(previousArticle.slug),
                navigation_type: 'footer_nav'
              });
            }}
          >
            <Card className="p-4 hover:shadow-lg transition-shadow cursor-pointer h-full">
              <div className="flex items-start gap-3">
                <div className="text-link text-2xl">←</div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1">PREVIOUS ARTICLE</div>
                  <h4 className="font-semibold mb-1">{previousArticle.title}</h4>
                  <p className="text-sm text-muted-foreground">{previousArticle.description}</p>
                </div>
              </div>
            </Card>
          </Link>
        ) : (
          <div></div>
        )}

        {/* Next Article */}
        {nextArticle ? (
          <Link 
            href={`/blog/ai-development-mastery-series/${nextArticle.slug}`}
            onClick={() => {
              trackEvent('series_navigation_used', {
                from_article: getArticleName(seriesArticles[currentIndex]?.slug || ''),
                to_article: getArticleName(nextArticle.slug),
                navigation_type: 'footer_nav'
              });
            }}
          >
            <Card className="p-4 hover:shadow-lg transition-shadow cursor-pointer h-full">
              <div className="flex items-start gap-3">
                <div>
                  <div className="text-xs text-muted-foreground mb-1">NEXT ARTICLE</div>
                  <h4 className="font-semibold mb-1">{nextArticle.title}</h4>
                  <p className="text-sm text-muted-foreground">{nextArticle.description}</p>
                </div>
                <div className="text-link text-2xl">→</div>
              </div>
            </Card>
          </Link>
        ) : (
          <Card className="p-4 bg-muted/20 border border-border">
            <div className="text-center">
              <div className="text-2xl mb-2">🎉</div>
              <h4 className="font-semibold mb-1">Series Complete!</h4>
              <p className="text-sm text-muted-foreground">
                You&apos;ve mastered the AI Development Framework
              </p>
            </div>
          </Card>
        )}
      </div>

      {/* Series Overview Link */}
      <div className="text-center">
        <Link 
          href="/blog/ai-development-mastery-series"
          onClick={() => {
            trackEvent('series_navigation_used', {
              from_article: getArticleName(seriesArticles[currentIndex]?.slug || ''),
              to_article: 'series_overview',
              navigation_type: 'footer_nav'
            });
          }}
        >
          <Button variant="outline">
            ← Back to Series Overview
          </Button>
        </Link>
      </div>
    </div>
  );
}