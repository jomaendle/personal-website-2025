import type { MetadataRoute } from "next";
import { readdirSync, statSync } from "fs";
import { join } from "path";
import { BLOG_POSTS } from "@/lib/state/blog";

const baseUrl = "https://jomaendle.com";

/**
 * Slugs that are actually published.
 *
 * The scan below walks `app/blog/*` on disk, so without this filter every
 * directory containing a `page.mdx` is submitted to search engines — including
 * drafts that are deliberately kept out of `BLOG_POSTS` and off the blog index.
 * `BLOG_POSTS` is the publication decision; the filesystem is not.
 */
const PUBLISHED_SLUGS = new Set(BLOG_POSTS.map((post) => post.slug));

function getBlogPosts() {
  const blogDir = join(process.cwd(), "app", "blog");

  try {
    const entries = readdirSync(blogDir, { withFileTypes: true });
    return entries
      .filter((entry) => entry.isDirectory())
      .filter((entry) => PUBLISHED_SLUGS.has(entry.name))
      .map((entry) => {
        const postPath = join(blogDir, entry.name);
        const mdxPath = join(postPath, "page.mdx");

        try {
          const stats = statSync(mdxPath);
          return {
            slug: entry.name,
            lastModified: stats.mtime,
          };
        } catch {
          return null;
        }
      })
      .filter(Boolean);
  } catch {
    return [];
  }
}

export default function sitemap(): MetadataRoute.Sitemap {
  const blogPosts = getBlogPosts();

  const now = new Date();
  const staticPages = [
    {
      url: baseUrl,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/business`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.9,
      alternates: {
        languages: {
          de: `${baseUrl}/business`,
          en: `${baseUrl}/business/en`,
        },
      },
    },
    {
      url: `${baseUrl}/business/en`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.8,
      alternates: {
        languages: {
          de: `${baseUrl}/business`,
          en: `${baseUrl}/business/en`,
        },
      },
    },
    {
      url: `${baseUrl}/about`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/impressum`,
      lastModified: now,
      changeFrequency: "yearly" as const,
      priority: 0.3,
    },
    {
      url: `${baseUrl}/datenschutz`,
      lastModified: now,
      changeFrequency: "yearly" as const,
      priority: 0.3,
    },
  ];

  const blogPages = blogPosts.map((post) => ({
    url: `${baseUrl}/blog/${post?.slug}`,
    lastModified: post?.lastModified,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  return [...staticPages, ...blogPages];
}
