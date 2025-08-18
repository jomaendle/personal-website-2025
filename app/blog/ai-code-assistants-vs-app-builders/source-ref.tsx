"use client";

import { useState } from "react";

interface SourceRefProps {
  id: number;
  children: React.ReactNode;
}

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

export function SourceRef({ id, children }: SourceRefProps) {
  const [isHovered, setIsHovered] = useState(false);
  const source = sourceData[id as keyof typeof sourceData];

  if (!source) {
    return <span>{children}</span>;
  }

  const handleClick = () => {
    // Scroll to sources section - find by heading text
    const headings = document.querySelectorAll("h2");
    let sourcesSection = null;

    for (const heading of headings) {
      if (heading.textContent?.includes("Sources")) {
        sourcesSection = heading;
        break;
      }
    }

    if (sourcesSection) {
      sourcesSection.scrollIntoView({ behavior: "smooth" });

      // Highlight the specific source
      const sourceElement = document.getElementById(`source-${id}`);
      if (sourceElement) {
        sourceElement.classList.add("bg-blue-100", "border-blue-300");
        setTimeout(() => {
          sourceElement.classList.remove("bg-blue-100", "border-blue-300");
        }, 2000);
      }
    }
  };

  return (
    <span className="relative">
      <span
        className="cursor-pointer text-link underline decoration-dotted underline-offset-2 hover:text-link-hover"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={handleClick}
      >
        {children}
        <sup className="ml-0.5 text-xs">[{id}]</sup>
      </span>

      {isHovered && (
        <div className="pointer-events-none absolute bottom-full left-0 z-50 mb-2 w-80 rounded-lg bg-gray-900 p-3 text-sm text-white shadow-lg">
          <div className="mb-2">
            <div className="mb-1 font-semibold">{source.title}</div>
            <div className="mb-2 flex items-center gap-2">
              <span
                className={`rounded px-2 py-1 text-xs font-medium ${
                  source.type === "research"
                    ? "bg-blue-600 text-white"
                    : source.type === "survey"
                      ? "bg-green-600 text-white"
                      : "bg-orange-600 text-white"
                }`}
              >
                {source.type?.toUpperCase()}
              </span>
              <span
                className={`rounded px-2 py-1 text-xs font-medium ${
                  source.credibility === "high"
                    ? "bg-emerald-600 text-white"
                    : "bg-yellow-600 text-white"
                }`}
              >
                {source.credibility?.toUpperCase()} TRUST
              </span>
            </div>
          </div>
          <div className="text-xs text-gray-300">{source.description}</div>
          <div className="absolute left-4 top-full h-0 w-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
        </div>
      )}
    </span>
  );
}
