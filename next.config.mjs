import createMDX from "@next/mdx";

/** @type {import('next').NextConfig} */
const nextConfig = {
  pageExtensions: ["mdx", "jsx", "js", "ts", "tsx"],
  experimental: {
    // No `viewTransition` flag: Next 16 removed it, and this site never needed
    // it anyway — navigation transitions come from `next-view-transitions`
    // (which drives `document.startViewTransition` itself), not from React's
    // `<ViewTransition>`.
    optimizePackageImports: [
      "framer-motion",
      "lucide-react",
      "@radix-ui/react-slot",
      "@radix-ui/react-tabs",
      "@codesandbox/sandpack-react",
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
    // Content-Security-Policy. Kept deliberately explicit about the third
    // parties this site loads:
    //  - Plausible analytics (script + beacon)
    //  - Supabase (view counter, connect)
    //  - Giscus comments (script + iframe embed)
    //  - Sandpack / CodeSandbox live demos (needs 'unsafe-eval' + blob: workers
    //    and codesandbox iframes)
    // 'unsafe-inline'/'unsafe-eval' are required by Next's inline bootstrap and
    // Sandpack's bundler respectively; tighten with nonces if those are removed.
    const contentSecurityPolicy = [
      "default-src 'self'",
      "base-uri 'self'",
      "object-src 'none'",
      "frame-ancestors 'none'",
      "form-action 'self'",
      "manifest-src 'self'",
      "img-src 'self' data: blob: https:",
      "font-src 'self' data:",
      "style-src 'self' 'unsafe-inline' https://giscus.app",
      // va.vercel-scripts.com serves both @vercel/analytics and
      // @vercel/speed-insights. Both are mounted in app/layout.tsx but were
      // absent from this policy, so the browser blocked them in production as
      // well as dev — the site shipped both libraries and recorded nothing.
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://plausible.io https://giscus.app https://*.codesandbox.io https://va.vercel-scripts.com",
      "connect-src 'self' https://*.supabase.co https://plausible.io https://giscus.app https://*.codesandbox.io https://api.webstatus.dev https://va.vercel-scripts.com https://vitals.vercel-insights.com",
      "frame-src 'self' https://giscus.app https://codesandbox.io https://*.codesandbox.io",
      "worker-src 'self' blob:",
      "child-src 'self' blob:",
    ].join("; ");

    return [
      // No rule for `/_next/static/:path*`. Next serves its own hashed chunks
      // as `public,max-age=31536000,immutable` already, so the rule only
      // duplicated the framework's own header — and Next 16 warns about custom
      // Cache-Control under `/_next/` because it can break dev behaviour.
      // Everything below is in `public/`, which gets no automatic caching.
      // Self-hosted fonts
      {
        source: "/fonts/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      // Images and videos in public directory
      ...["webp", "png", "jpg", "gif", "mp4"].map((ext) => ({
        source: `/:slug/:path*.${ext}`,
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, stale-while-revalidate=86400",
          },
        ],
      })),
      // Favicons
      {
        source: "/favicon-:size.png",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=604800, stale-while-revalidate=86400",
          },
        ],
      },
      {
        source: "/favicon.ico",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=604800, stale-while-revalidate=86400",
          },
        ],
      },
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
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          {
            key: "Content-Security-Policy",
            value: contentSecurityPolicy,
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
    ];
  },
};

const withMDX = createMDX();

export default withMDX(nextConfig);
