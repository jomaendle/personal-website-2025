import type { MetadataRoute } from "next";
import { readdirSync, statSync } from "fs";
import { join } from "path";

const baseUrl = "https://jomaendle.com";

function getBlogPosts() {
  const blogDir = join(process.cwd(), "app", "blog");

  try {
    const entries = readdirSync(blogDir, { withFileTypes: true });
    return entries
      .filter((entry) => entry.isDirectory())
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
