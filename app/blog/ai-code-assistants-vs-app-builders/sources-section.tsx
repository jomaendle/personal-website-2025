"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";

interface Source {
  id: number;
  title: string;
  url: string;
  description: string;
  type: 'research' | 'survey' | 'industry';
  credibility: 'high' | 'medium';
}

const sources: Source[] = [
  {
    id: 1,
    title: "Qodo 2025 State of AI Code Quality Report",
    url: "https://www.qodo.ai/reports/state-of-ai-code-quality/",
    description: "Comprehensive survey of 609 developers covering AI tool usage patterns, productivity impacts, quality outcomes, and developer confidence levels",
    type: "survey",
    credibility: "high"
  },
  {
    id: 2,
    title: "InfoWorld / METR Developer Productivity Study",
    url: "https://www.infoworld.com/article/4020931/ai-coding-tools-can-slow-down-seasoned-developers-by-19.html",
    description: "Randomized controlled trial analyzing AI coding tool impact on developer productivity, including acceptance rates and performance metrics",
    type: "research",
    credibility: "high"
  },
  {
    id: 3,
    title: "ShiftMag 2025 Stack Overflow Developer Survey Analysis",
    url: "https://shiftmag.dev/stack-overflow-survey-2025-ai-5653/",
    description: "Analysis of Stack Overflow's annual developer survey focusing on AI tool adoption, trust levels, and community usage patterns",
    type: "survey",
    credibility: "high"
  },
];

export function SourcesSection() {
  const [filter, setFilter] = useState<'all' | 'research' | 'survey' | 'industry'>('all');
  
  const filteredSources = filter === 'all' 
    ? sources 
    : sources.filter(source => source.type === filter);

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'research': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'survey': return 'bg-green-100 text-green-800 border-green-200';
      case 'industry': return 'bg-orange-100 text-orange-800 border-orange-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getCredibilityColor = (credibility: string) => {
    return credibility === 'high' 
      ? 'bg-emerald-100 text-emerald-800 border-emerald-200' 
      : 'bg-yellow-100 text-yellow-800 border-yellow-200';
  };

  const getDomainFromUrl = (url: string) => {
    try {
      return new URL(url).hostname.replace('www.', '');
    } catch {
      return url;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
            filter === 'all' 
              ? 'bg-gray-900 text-white' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          All Sources ({sources.length})
        </button>
        <button
          onClick={() => setFilter('research')}
          className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
            filter === 'research' 
              ? 'bg-blue-600 text-white' 
              : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
          }`}
        >
          Research ({sources.filter(s => s.type === 'research').length})
        </button>
        <button
          onClick={() => setFilter('survey')}
          className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
            filter === 'survey' 
              ? 'bg-green-600 text-white' 
              : 'bg-green-100 text-green-800 hover:bg-green-200'
          }`}
        >
          Surveys ({sources.filter(s => s.type === 'survey').length})
        </button>
      </div>

      <div className="grid gap-4">
        {filteredSources.map((source) => (
          <Card 
            key={source.id} 
            id={`source-${source.id}`}
            className="p-4 hover:shadow-md transition-shadow border-l-4 border-l-blue-500"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg font-bold text-blue-600">#{source.id}</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getTypeColor(source.type)}`}>
                    {source.type.toUpperCase()}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getCredibilityColor(source.credibility)}`}>
                    {source.credibility === 'high' ? 'HIGH TRUST' : 'MEDIUM TRUST'}
                  </span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2 leading-tight">
                  {source.title}
                </h3>
                <p className="text-sm text-gray-600 mb-3">
                  {source.description}
                </p>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">
                    Source: {getDomainFromUrl(source.url)}
                  </span>
                </div>
              </div>
            </div>
            <a 
              href={source.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
            >
              View Source →
            </a>
          </Card>
        ))}
      </div>
    </div>
  );
}