/**
 * Writing categories — Editorial design layer (additive).
 *
 * The canonical post list in `lib/state/blog.ts` has no taxonomy, so rather
 * than mutate it we map slug -> category here. Used by the Writing index
 * filter and the article meta header. Add a line when you publish a post;
 * anything unmapped falls back to "Notes".
 */

export type WritingCategory =
  | "AI · SDLC"
  | "CSS"
  | "Build"
  | "Platform"
  | "Notes";

export const WRITING_CATEGORY: Record<string, WritingCategory> = {
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

export const WRITING_FILTERS: ("All" | WritingCategory)[] = [
  "All",
  "AI · SDLC",
  "CSS",
  "Build",
  "Platform",
];

export function categoryFor(slug: string): WritingCategory {
  return WRITING_CATEGORY[slug] ?? "Notes";
}
