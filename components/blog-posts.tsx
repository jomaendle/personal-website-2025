"use client";

import { H2, H3 } from "@/components/ui/heading";
import Link from "next/link";
import { ViewCounterWithProvider } from "@/components/view-counter-provider";

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
].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

export function BlogPosts() {
  return (
    <>
      {blogPosts.map((post, index) => (
        <article key={index}>
          <Link
            href={post.link}
            className="block group flex gap-4 items-center"
            prefetch={false}
          >
            <div className="flex-1">
              <H3>{post.title}</H3>
              <p className="text-muted-foreground">{post.date} • Medium</p>
            </div>
            <ViewCounterWithProvider slug={post.slug} />
          </Link>
        </article>
      ))}
    </>
  );
}

export function BlogPostList({ currentSlug }: { currentSlug: string }) {
  return (
    <aside className="flex flex-col gap-6 text-sm">
      <H2 className="mb-0">More Posts</H2>

      <div className="flex flex-col gap-4">
        {blogPosts
          .filter((post) => post.slug !== currentSlug)
          .map((post, index) => (
            <article key={index}>
              <Link
                href={post.link}
                className="block group flex gap-4 items-center"
                prefetch={false}
              >
                <H3 className="line-clamp-2">{post.title}</H3>
              </Link>
            </article>
          ))}
      </div>
    </aside>
  );
}
