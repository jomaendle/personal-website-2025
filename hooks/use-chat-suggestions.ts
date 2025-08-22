"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

interface SuggestionConfig {
  pattern: RegExp;
  suggestions: string[];
}

// Suggestion configurations based on URL patterns
const SUGGESTION_CONFIGS: SuggestionConfig[] = [
  {
    pattern: /^\/blog\/([^/]+)$/,
    suggestions: [
      "Explain this topic in simple terms",
      "What are the key takeaways?",
      "Show me related articles",
      "How can I implement this?",
    ],
  },
  {
    pattern: /^\/blog\/.*react/i,
    suggestions: [
      "Best React component patterns",
      "React performance optimization",
      "Modern React hooks usage",
      "React vs other frameworks",
    ],
  },
  {
    pattern: /^\/blog\/.*css/i,
    suggestions: [
      "Advanced CSS techniques",
      "CSS animation best practices",
      "Modern CSS layout methods",
      "CSS performance tips",
    ],
  },
  {
    pattern: /^\/blog\/.*animation/i,
    suggestions: [
      "Creating smooth animations",
      "Animation performance tips",
      "CSS vs JavaScript animations",
      "Animation accessibility",
    ],
  },
  {
    pattern: /^\/blog\/.*ai/i,
    suggestions: [
      "AI development tools",
      "AI integration best practices",
      "AI ethics in development",
      "Future of AI in web dev",
    ],
  },
  {
    pattern: /^\/blog\/.*javascript/i,
    suggestions: [
      "Modern JavaScript features",
      "JavaScript performance optimization",
      "ES2024 new features",
      "JavaScript debugging tips",
    ],
  },
];

// Default suggestions for general pages
const DEFAULT_SUGGESTIONS: string[] = [
  "What topics do you cover?",
  "Tell me about React components",
  "How to create CSS animations?",
  "Web development best practices",
  "AI tools for developers",
  "JavaScript performance tips",
];

// Homepage specific suggestions
const HOMEPAGE_SUGGESTIONS: string[] = [
  "What can you help me with?",
  "Show me your latest articles",
  "Web development trends 2025",
  "Your most popular posts",
  "Getting started with React",
  "CSS animation tutorials",
];

/**
 * Hook to provide contextual chat suggestions based on current page
 */
export function useChatSuggestions(): string[] {
  const pathname = usePathname();
  const [suggestions, setSuggestions] = useState<string[]>([]);

  useEffect(() => {
    const getSuggestionsForPath = (path: string | null): string[] => {
      // Homepage
      if (!path || path === "" || path === "/") {
        return HOMEPAGE_SUGGESTIONS;
      }

      if (path === "/") {
        return HOMEPAGE_SUGGESTIONS;
      }

      // Check specific patterns
      for (const config of SUGGESTION_CONFIGS) {
        if (config.pattern.test(path)) {
          return config.suggestions;
        }
      }

      // Blog index page
      if (path === "/blog" || path.startsWith("/blog/")) {
        const blogPost = path.match(/^\/blog\/([^/]+)$/)?.[1];

        if (blogPost) {
          // For specific blog posts, check content-based suggestions
          const contentSuggestions = getContentBasedSuggestions(blogPost);
          if (contentSuggestions.length > 0) {
            return contentSuggestions;
          }
        }

        // General blog suggestions
        return [
          "Summarize this article",
          "What are the main points?",
          "Show me similar articles",
          "How to implement this?",
          "What are the prerequisites?",
          "Best practices mentioned here",
        ];
      }

      return DEFAULT_SUGGESTIONS;
    };

    const newSuggestions = getSuggestionsForPath(pathname);
    setSuggestions(newSuggestions);
  }, [pathname]);

  return suggestions;
}

/**
 * Get content-based suggestions for specific blog posts
 */
function getContentBasedSuggestions(slug: string): string[] {
  const contentMap: Record<string, string[]> = {
    "css-carousel": [
      "How to create a CSS carousel?",
      "CSS scroll-snap properties",
      "Carousel accessibility tips",
      "Mobile carousel best practices",
    ],
    "animated-sign-up-button": [
      "Creating animated buttons",
      "CSS transform animations",
      "Button accessibility features",
      "Animation performance tips",
    ],
    "html-popover": [
      "HTML popover API usage",
      "Popover accessibility guidelines",
      "JavaScript popover alternatives",
      "Modern CSS popover techniques",
    ],
    "responsive-ui-components": [
      "Responsive design patterns",
      "Mobile-first CSS approach",
      "Component breakpoint strategies",
      "Fluid typography techniques",
    ],
    "ai-code-assistants-vs-app-builders": [
      "AI development tools comparison",
      "Code assistant productivity tips",
      "AI app builder limitations",
      "Choosing the right AI tool",
    ],
    "focus-zoom-at-property": [
      "CSS @property usage",
      "Custom CSS properties",
      "Animation with CSS variables",
      "Modern CSS features",
    ],
    animations: [
      "Web animation best practices",
      "CSS vs JavaScript animations",
      "Animation performance optimization",
      "Accessible animations",
    ],
    "align-dates-in-tables": [
      "Table styling best practices",
      "CSS grid for tables",
      "Responsive table design",
      "Table accessibility features",
    ],
    "freelance-tool": [
      "Freelance development tools",
      "Project management tips",
      "Client communication strategies",
      "Pricing development work",
    ],
  };

  return contentMap[slug] || [];
}

export default useChatSuggestions;
