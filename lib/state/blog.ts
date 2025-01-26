export const ANIMATED_SIGN_UP_BUTTON = {
  slug: "animated-sign-up-button",
  date: "Jan 25, 2025",
  link: "/blog/animated-sign-up-button",
  title: "Creating an Animated Sign Up Button",
};

export const blogPosts: {
  title: string;
  date: string;
  link: string;
  slug: string;
}[] = [
  {
    title: "Animating Gradients in CSS",
    date: "Dec 5, 2023",
    link: "/blog/animations",
    slug: "animations",
  },
  {
    title: "Making Responsive UI Components with display: contents",
    date: "Sep 15, 2024",
    link: "/blog/responsive-ui-components",
    slug: "responsive-ui-components",
  },
  {
    title: "Aligning Dates in Tabular Data",
    date: "Sep 29, 2024",
    link: "/blog/align-dates-in-tables",
    slug: "align-dates-in-tables",
  },
  ANIMATED_SIGN_UP_BUTTON,
].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
