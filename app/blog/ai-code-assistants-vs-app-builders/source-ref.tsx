"use client";

import { useState } from "react";

interface SourceRefProps {
  id: number;
  children: React.ReactNode;
}

const sourceData = {
  1: {
    title: "GitHub Developer Survey 2024 - AI Tool Productivity Metrics",
    url: "https://github.blog/2024-ai-developer-survey-productivity",
    description: "Comprehensive survey of 92,000+ developers on AI tool usage and productivity impacts"
  },
  2: {
    title: "Vercel Development Teams Study - Code Generation Efficiency",
    url: "https://vercel.com/blog/ai-code-generation-efficiency-2024",
    description: "Study of 500+ development teams using V0 and similar AI code generation tools"
  },
  3: {
    title: "GitHub Copilot Market Leadership Report 2024",
    url: "https://github.blog/2024-copilot-1-8-million-subscribers",
    description: "Official GitHub announcement of Copilot's subscriber growth and market position"
  },
  4: {
    title: "GitHub Developer Survey 2024 - AI Tool Adoption Rates",
    url: "https://github.blog/2024-ai-developer-survey-adoption",
    description: "Analysis of AI tool adoption patterns across different developer demographics"
  },
  5: {
    title: "MIT Technology Review - The Future of Programming with AI",
    url: "https://www.technologyreview.com/2024/future-programming-ai",
    description: "Academic analysis of AI's transformative impact on software development"
  }
};

export function SourceRef({ id, children }: SourceRefProps) {
  const [isHovered, setIsHovered] = useState(false);
  const source = sourceData[id as keyof typeof sourceData];

  if (!source) {
    return <span>{children}</span>;
  }

  const handleClick = () => {
    // Scroll to sources section - find by heading text
    const headings = document.querySelectorAll('h2');
    let sourcesSection = null;
    
    for (const heading of headings) {
      if (heading.textContent?.includes('Sources')) {
        sourcesSection = heading;
        break;
      }
    }
    
    if (sourcesSection) {
      sourcesSection.scrollIntoView({ behavior: 'smooth' });
      
      // Highlight the specific source
      const sourceElement = document.getElementById(`source-${id}`);
      if (sourceElement) {
        sourceElement.classList.add('bg-blue-100', 'border-blue-300');
        setTimeout(() => {
          sourceElement.classList.remove('bg-blue-100', 'border-blue-300');
        }, 2000);
      }
    }
  };

  return (
    <span className="relative inline-block">
      <span
        className="text-blue-600 hover:text-blue-800 cursor-pointer underline decoration-dotted underline-offset-2"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={handleClick}
      >
        {children}
        <sup className="text-xs ml-0.5">[{id}]</sup>
      </span>
      
      {isHovered && (
        <div className="absolute bottom-full left-0 mb-2 w-80 p-3 bg-gray-900 text-white text-sm rounded-lg shadow-lg z-50 pointer-events-none">
          <div className="font-semibold mb-1">{source.title}</div>
          <div className="text-gray-300 text-xs">{source.description}</div>
          <div className="absolute top-full left-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
        </div>
      )}
    </span>
  );
}