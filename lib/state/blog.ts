export const ANIMATED_SIGN_UP_BUTTON = {
  slug: "animated-sign-up-button",
  date: "Jan 25, 2025",
  title: "Creating an Animated Sign Up Button",
};

export const FOCUS_ZOOM_MASK_IMAGE = {
  title: "Dynamic Focus Zoom Effect with CSS @property",
  date: "Jan 28, 2025",
  slug: "focus-zoom-at-property",
};

export const HTML_POPOVER = {
  title: "HTML Popover reached Baseline Support",
  date: "Feb 12, 2025",
  slug: "html-popover",
};

export const FREELANCE_TOOL = {
  title: "Vibe-coding my own Freelance-Tracking Tool",
  date: "Apr 15, 2025",
  slug: "freelance-tool",
};
export const CSS_CAROUSEL = {
  title: "Native CSS Carousels with ::scroll-button and ::scroll-marker",
  date: "Apr 25, 2025",
  slug: "css-carousel",
};

export const CLAUDE_CODE_ESSENTIALS_FOUNDATIONS = {
  title: "Claude Code Essentials: Foundation for Effective AI Development",
  date: "Nov 23, 2025",
  slug: "claude-code-essentials-foundations",
};

export const CLAUDE_CODE_ADVANCED_WORKFLOWS = {
  title: "Advanced Claude Code: Automation, Agents, and Power Workflows",
  date: "Nov 23, 2025",
  slug: "claude-code-advanced-workflows",
};

export const CLAUDE_CODE_PRODUCTION_SECURITY = {
  title: "Production-Ready Claude Code: Testing and Security Best Practices",
  date: "Nov 23, 2025",
  slug: "claude-code-production-security",
};

export const BLOG_POSTS: {
  title: string;
  date: string;
  slug: string;
}[] = [
  {
    title: "Animating Gradients in CSS",
    date: "Dec 5, 2023",
    slug: "animations",
  },
  {
    title: "Making Responsive UI Components with display: contents",
    date: "Sep 15, 2024",
    slug: "responsive-ui-components",
  },
  {
    title: "Aligning Dates in Tabular Data",
    date: "Sep 29, 2024",
    slug: "align-dates-in-tables",
  },
  ANIMATED_SIGN_UP_BUTTON,
  FOCUS_ZOOM_MASK_IMAGE,
  HTML_POPOVER,
  FREELANCE_TOOL,
  CSS_CAROUSEL,
  CLAUDE_CODE_ESSENTIALS_FOUNDATIONS,
].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
