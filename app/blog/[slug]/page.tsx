"use client";

import Link from "next/link";
import { Footer } from "@/components/ui/footer";

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
    <main className="px-6 py-16 md:px-16 md:py-24 lg:px-24">
      <div className="max-w-2xl mx-auto">
        <Link
          href="/"
          className="inline-block text-sm text-muted-foreground hover:text-primary transition-colors mb-16"
        >
          ← Back
        </Link>

        <div className="prose">
          <Post />
        </div>
        <Footer />
      </div>
    </main>
  );
}
