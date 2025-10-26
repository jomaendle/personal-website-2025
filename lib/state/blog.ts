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

export const BEYOND_VIBE_CODING = {
  title: "Beyond Vibe Coding: Building an AI-Powered Development Workflow That Actually Works",
  date: "Oct 25, 2025",
  slug: "beyond-vibe-coding",
};

export const BLOG_POSTS: {
  title: string;
  date: string;
  slug: string;
}[] = [
  /* {
    title:
      "AI Code Assistants vs AI App Builders: A Strategic Guide to Modern Development Tools",
    slug: "ai-code-assistants-vs-app-builders",
    date: "Aug 15, 2025",
  },*/
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
  BEYOND_VIBE_CODING,
].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
