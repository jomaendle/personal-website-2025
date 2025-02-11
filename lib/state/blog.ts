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
].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
