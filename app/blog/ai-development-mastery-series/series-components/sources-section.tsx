"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { useAnalytics, getArticleName, getArticleSlug } from "@/lib/useAnalytics";

const sourceData = {
  1: {
    title: "Qodo 2025 State of AI Code Quality Report",
    url: "https://www.qodo.ai/reports/state-of-ai-code-quality/",
    description: "Comprehensive survey of 609 developers covering AI tool usage patterns, productivity impacts, quality outcomes, and developer confidence levels",
    type: "survey",
    credibility: "high",
  },
  2: {
    title: "InfoWorld / METR Developer Productivity Study",
    url: "https://www.infoworld.com/article/4020931/ai-coding-tools-can-slow-down-seasoned-developers-by-19.html",
    description: "Randomized controlled trial analyzing AI coding tool impact on developer productivity, including acceptance rates and performance metrics",
    type: "research",
    credibility: "high",
  },
  3: {
    title: "ShiftMag 2025 Stack Overflow Developer Survey Analysis",
    url: "https://shiftmag.dev/stack-overflow-survey-2025-ai-5653/",
    description: "Analysis of Stack Overflow's annual developer survey focusing on AI tool adoption, trust levels, and community usage patterns",
    type: "survey",
    credibility: "high",
  },
};

interface SourcesSectionProps {
  usedSources: number[];
}

export function SourcesSection({ usedSources }: SourcesSectionProps) {
  const pathname = usePathname();
  const { trackSourceInteraction } = useAnalytics();
  
  // Track sources section view
  useEffect(() => {
    const articleSlug = getArticleSlug(pathname || '');
    const articleName = getArticleName(articleSlug);
    
    trackSourceInteraction('section_viewed', {
      article: articleName,
      sourceCount: usedSources.length
    });
  }, [pathname, usedSources.length, trackSourceInteraction]);
  const getTypeColor = (type: string) => {
    switch (type) {
      case "research":
        return "bg-link text-white";
      case "survey":
        return "bg-secondary text-foreground";
      default:
        return "bg-muted text-foreground";
    }
  };

  const getCredibilityColor = (credibility: string) => {
    return credibility === "high" ? "bg-link text-white" : "bg-muted text-foreground";
  };

  return (
    <div className="space-y-6 mt-16 pt-8 border-t border-border">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">📚 Sources & Research</h2>
        <p className="text-muted-foreground">
          This analysis is based on peer-reviewed research and comprehensive industry surveys
        </p>
      </div>

      <div className="space-y-4">
        {usedSources.map((sourceId) => {
          const source = sourceData[sourceId as keyof typeof sourceData];
          if (!source) return null;

          return (
            <Card 
              key={sourceId} 
              id={`source-${sourceId}`}
              className="p-6 transition-colors duration-200"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-bold text-link text-lg">[{sourceId}]</span>
                    <Badge className={getTypeColor(source.type)}>
                      {source.type.toUpperCase()}
                    </Badge>
                    <Badge className={getCredibilityColor(source.credibility)}>
                      {source.credibility.toUpperCase()} TRUST
                    </Badge>
                  </div>
                  <h3 className="text-lg font-semibold mb-2">
                    <a 
                      href={source.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-link hover:text-link/80 underline decoration-dotted underline-offset-2"
                      onClick={() => {
                        const articleSlug = getArticleSlug(pathname || '');
                        const articleName = getArticleName(articleSlug);
                        
                        trackSourceInteraction('external_visited', {
                          article: articleName,
                          sourceId: sourceId,
                          sourceUrl: source.url,
                          sourceType: source.type as 'research' | 'survey' | 'report'
                        });
                      }}
                    >
                      {source.title}
                    </a>
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    {source.description}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <div className="text-muted-foreground">
                  Click reference numbers in article to highlight source
                </div>
                <a 
                  href={source.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-link hover:text-link/80 font-medium"
                  onClick={() => {
                    const articleSlug = getArticleSlug(pathname || '');
                    const articleName = getArticleName(articleSlug);
                    
                    trackSourceInteraction('external_visited', {
                      article: articleName,
                      sourceId: sourceId,
                      sourceUrl: source.url,
                      sourceType: source.type as 'research' | 'survey' | 'report'
                    });
                  }}
                >
                  View Source →
                </a>
              </div>
            </Card>
          );
        })}
      </div>

      <div className="bg-muted/20 rounded-lg p-6 border border-border">
        <h4 className="font-semibold mb-2">🔍 Research Methodology</h4>
        <p className="text-sm text-muted-foreground">
          All findings are based on peer-reviewed research, controlled studies, and comprehensive industry surveys. 
          Source credibility is evaluated based on methodology rigor, sample size, and publication standards.
        </p>
      </div>
    </div>
  );
}