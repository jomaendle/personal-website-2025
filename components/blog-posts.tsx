import { H3 } from "@/components/ui/heading";
import Link from "next/link";

const blogPosts = [
  {
    title: "Working with Animations",
    date: "Jan 20, 2025",
    link: "/blog/animations",
  },
  {
    title: "Making Responsive UI Components with display: contents",
    date: "Sep 15, 2024",
    link: "/blog/responsive-ui-components",
  },
  {
    title: "A Primer on Scroll-Driven Animations",
    date: "Jul 25, 2024",
    link: "/blog/scroll-driven-animations",
  },
  {
    title: "Building a Customizable SVG Progress Indicator with Angular",
    date: "Jul 15, 2024",
    link: "/blog/svg-progress",
  },
];

export default function BlogPosts() {
  return (
    <>
      {blogPosts.map((post, index) => (
        <article key={index}>
          <Link href={post.link} className="block group">
            <H3>{post.title}</H3>
            <p className="text-muted-foreground">{post.date} • Medium</p>
          </Link>
        </article>
      ))}
    </>
  );
}
