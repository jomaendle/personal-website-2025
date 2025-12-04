import createMDX from "@next/mdx";

/** @type {import('next').NextConfig} */
const nextConfig = {
  pageExtensions: ["mdx", "jsx", "js", "ts", "tsx"],
  experimental: {
    viewTransition: true,
    optimizePackageImports: [
      "framer-motion",
      "lucide-react",
      "@radix-ui/react-slot",
      "@codesandbox/sandpack-react",
      "@codesandbox/sandpack-themes",
      "@react-email/components",
    ],
  },
  images: {
    formats: ["image/webp", "image/avif"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 31536000, // 1 year
    dangerouslyAllowSVG: false,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  compress: true,
  poweredByHeader: false,
  generateEtags: true,
  trailingSlash: false,
  async headers() {
    return [
      // Giscus theme endpoint - needs CORS and caching for external iframe access
      {
        source: "/api/giscus-theme",
        headers: [
          {
            key: "Content-Type",
            value: "text/css; charset=utf-8",
          },
          {
            key: "Access-Control-Allow-Origin",
            value: "*",
          },
          {
            key: "Access-Control-Allow-Methods",
            value: "GET, OPTIONS",
          },
          {
            key: "Access-Control-Allow-Headers",
            value: "Content-Type, Authorization",
          },
          {
            key: "Vary",
            value: "Origin",
          },
          {
            key: "Cache-Control",
            value: "public, max-age=60, stale-while-revalidate=300",
          },
        ],
      },
      // === AGGRESSIVE CDN CACHING ===
      // 1. Next.js Static Assets (JavaScript, CSS, Media)
      {
        source: "/_next/static/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      // 2. Public Static Assets (Images, Fonts, Favicons)
      {
        source: "/(.*)\\.(jpg|jpeg|png|webp|avif|gif|svg|ico|woff|woff2|ttf|otf|eot)$",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      // 3. Static Text Files (Sitemap, Robots)
      {
        source: "/(sitemap\\.xml|robots\\.txt)$",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=3600, s-maxage=86400",
          },
        ],
      },
      // 4. OG Image API (Cache for 1 week)
      {
        source: "/api/og-image",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=604800, s-maxage=604800, stale-while-revalidate=86400",
          },
        ],
      },
      // 5. Static HTML Pages (Homepage & Blog Posts)
      {
        source: "/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=3600, s-maxage=86400, stale-while-revalidate=86400",
          },
        ],
      },
      // Generic security headers for all routes
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
        ],
      },
      // Specific API routes that need no-cache
      {
        source: "/api/contact",
        headers: [
          {
            key: "Cache-Control",
            value: "no-store, no-cache, must-revalidate",
          },
        ],
      },
      {
        source: "/api/subscribe",
        headers: [
          {
            key: "Cache-Control",
            value: "no-store, no-cache, must-revalidate",
          },
        ],
      },
      {
        source: "/api/unsubscribe",
        headers: [
          {
            key: "Cache-Control",
            value: "no-store, no-cache, must-revalidate",
          },
        ],
      },
      {
        source: "/api/increment-view",
        headers: [
          {
            key: "Cache-Control",
            value: "no-store, no-cache, must-revalidate",
          },
        ],
      },
      {
        source: "/api/list-view-count",
        headers: [
          {
            key: "Cache-Control",
            value: "no-store, no-cache, must-revalidate",
          },
        ],
      },
    ];
  },
};

const withMDX = createMDX();

export default withMDX(nextConfig);
