"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { useAnalytics } from "@/lib/useAnalytics";

interface SeriesArticle {
  id: number;
  title: string;
  description: string;
  readTime: string;
  targetAudience: string;
  keyFeatures: string[];
  slug: string;
  status: 'available' | 'coming-soon';
}

const seriesArticles: SeriesArticle[] = [
  {
    id: 1,
    title: "Find Your AI Development Level",
    description: "Complete assessment framework to identify your current mastery level and get personalized advancement strategies.",
    readTime: "6-8 min read",
    targetAudience: "All Levels",
    keyFeatures: [
      "Interactive mastery assessment",
      "Personalized skill gap analysis", 
      "Level-specific next steps",
      "Industry benchmarking"
    ],
    slug: "ai-development-assessment",
    status: 'available'
  },
  {
    id: 2,
    title: "The AI Developer's Tool Selection Matrix",
    description: "End trial-and-error tool adoption with data-driven selection framework based on project requirements and experience level.",
    readTime: "7-9 min read",
    targetAudience: "AI-Curious to AI-Integrated",
    keyFeatures: [
      "Interactive tool selector",
      "Context-aware recommendations",
      "Workflow optimization patterns",
      "ROI analysis framework"
    ],
    slug: "ai-tool-selection-matrix",
    status: 'available'
  },
  {
    id: 3,
    title: "The 30-Day AI Development Transformation",
    description: "Complete implementation guide with structured pathway from assessment to measurable productivity gains.",
    readTime: "8-10 min read", 
    targetAudience: "Committed to Systematic Growth",
    keyFeatures: [
      "Interactive roadmap timeline",
      "Daily practice frameworks",
      "Progress tracking system",
      "Troubleshooting guide"
    ],
    slug: "30-day-transformation-guide",
    status: 'available'
  },
  {
    id: 4,
    title: "Mastering AI Development Workflows",
    description: "Advanced orchestration patterns and team leadership frameworks for AI-integrated to AI-orchestrating developers.",
    readTime: "8-10 min read",
    targetAudience: "AI-Integrated to AI-Orchestrating",
    keyFeatures: [
      "Multi-tool orchestration patterns",
      "Team integration frameworks", 
      "Advanced workflow automation",
      "Future-proofing strategies"
    ],
    slug: "advanced-ai-workflows",
    status: 'available'
  }
];

export function SeriesNavigation() {
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
  const getAudienceColor = (audience: string) => {
    if (audience.includes("All")) return "bg-secondary text-muted-foreground";
    if (audience.includes("AI-Curious")) return "bg-secondary text-foreground";
    if (audience.includes("AI-Integrated")) return "bg-muted/50 text-foreground";
    if (audience.includes("Committed")) return "bg-secondary/70 text-foreground";
    return "bg-muted/30 text-foreground";
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-6">
        {seriesArticles.map((article) => (
          <Card key={article.id} className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-link text-white flex items-center justify-center font-bold text-sm">
                  {article.id}
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-1">{article.title}</h3>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={getAudienceColor(article.targetAudience)}>
                      {article.targetAudience}
                    </Badge>
                    <span className="text-sm text-muted-foreground">{article.readTime}</span>
                  </div>
                </div>
              </div>
              
              {article.status === 'available' ? (
                <Link 
                  href={`/blog/ai-development-mastery-series/${article.slug}`}
                  onClick={() => {
                    trackEvent('series_navigation_used', {
                      from_article: 'series_overview',
                      to_article: getArticleName(article.slug),
                      navigation_type: 'series_nav'
                    });
                  }}
                >
                  <Button>
                    Read Article →
                  </Button>
                </Link>
              ) : (
                <Button variant="outline" disabled>
                  Coming Soon
                </Button>
              )}
            </div>

            <p className="text-muted-foreground mb-4">
              {article.description}
            </p>

            <div>
              <h4 className="font-medium text-sm text-muted-foreground mb-2">KEY FEATURES</h4>
              <div className="grid md:grid-cols-2 gap-2">
                {article.keyFeatures.map((feature, index) => (
                  <div key={index} className="flex items-center text-sm">
                    <span className="mr-2 text-blue-600">✓</span>
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="bg-muted/20 rounded-lg p-6 text-center border border-border">
        <h3 className="text-lg font-semibold mb-2">💡 Series Completion Bonus</h3>
        <p className="text-sm text-muted-foreground">
          Complete all 4 articles for comprehensive mastery spanning assessment, tool selection, 
          implementation, and advanced orchestration techniques.
        </p>
      </div>
    </div>
  );
}