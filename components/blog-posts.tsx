"use client";

import { H3 } from "@/components/ui/heading";
import Link from "next/link";
import { QueryClientProvider, useQuery } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Loader2 } from "lucide-react";

export const blogPosts = [
  {
    title: "Working with Animations",
    date: "Jan 20, 2025",
    link: "/blog/animations",
    slug: "animations",
  },
  {
    title: "Making Responsive UI Components with display: contents",
    date: "Sep 15, 2024",
    link: "/blog/responsive-ui-components",
    slug: "responsive-ui-components",
  },
];

export function BlogPosts() {
  const { data, isLoading } = useQuery({
    queryKey: ["blogPostsViews"],
    queryFn: () =>
      fetch("/api/list-view-count").then(
        (res): Promise<{ slug: string; views: number }[]> => res.json(),
      ),
    staleTime: 60 * 1000 * 5,
  });

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
            {isLoading && <Loader2 className="animate-spin size-4" />}
            {data && (
              <p className="text-muted-foreground text-sm">
                {data?.find((item) => item.slug === post.slug)?.views ?? 0}{" "}
                views
              </p>
            )}
          </Link>
        </article>
      ))}
    </>
  );
}

export function BlogPostsWithProvider() {
  return (
    <QueryClientProvider client={queryClient}>
      <BlogPosts />
    </QueryClientProvider>
  );
}
