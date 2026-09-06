/**
 * Slug to category, for the eyebrow on article rows and the article header.
 * Add a line when you publish a post; anything unmapped falls back to "Notes".
 */

export type WritingCategory =
  | "AI · SDLC"
  | "CSS"
  | "Build"
  | "Platform"
  | "Notes";

const WRITING_CATEGORY: Record<string, WritingCategory> = {
  "claude-code-essentials-foundations": "AI · SDLC",
  "css-carousel": "CSS",
  "freelance-tool": "Build",
  "html-popover": "Platform",
  "focus-zoom-at-property": "CSS",
  "animated-sign-up-button": "CSS",
  "align-dates-in-tables": "CSS",
  "responsive-ui-components": "CSS",
  animations: "CSS",
};

export function categoryFor(slug: string): WritingCategory {
  return WRITING_CATEGORY[slug] ?? "Notes";
}
