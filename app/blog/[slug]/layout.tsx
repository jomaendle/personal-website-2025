import { BLOG_POSTS } from "@/lib/state/blog";

// Generate static params for all blog posts at build time
export async function generateStaticParams() {
  return BLOG_POSTS.map((post) => ({
    slug: post.slug,
  }));
}

// Use ISR: Static generation with revalidation every 1 hour
// This allows view counts to update while still serving static pages
export const revalidate = 3600; // 1 hour in seconds

// Don't generate pages for slugs not returned by generateStaticParams
export const dynamicParams = false;

export default function BlogSlugLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
