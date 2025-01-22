"use client";

import Link from "next/link";
import { Footer } from "@/components/ui/footer";
import { ViewCounter } from "@/components/view-counter";
import { QueryClientProvider } from "@tanstack/react-query";
import { blogPosts } from "@/components/blog-posts";
import { queryClient } from "@/lib/queryClient";

interface BlogPostProps {
  params: {
    slug: string;
  };
}

export const dynamicParams = false;

export default async function BlogPost({ params }: BlogPostProps) {
  const slug = (await params).slug;
  const { default: Post } = await import(`@/content/blog/${slug}.mdx`);

  return (
    <QueryClientProvider client={queryClient}>
      <main className="px-6 py-16 md:px-16 md:py-24 lg:px-24">
        <div className="max-w-2xl mx-auto">
          <Link
            href="/"
            className="inline-block text-sm text-muted-foreground hover:text-primary transition-colors mb-12"
          >
            ← Back
          </Link>

          <div className="flex justify-between items-center gap-3 mb-12">
            {blogPosts.find((blogPost) => blogPost.slug === slug)?.date}
            <ViewCounter slug={slug} />
          </div>

          <div className="prose">
            <Post />
          </div>

          <Footer />
        </div>
      </main>
    </QueryClientProvider>
  );
}
