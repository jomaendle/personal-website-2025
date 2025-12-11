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
    // Enable React Server Components optimization
    serverActions: {
      bodySizeLimit: "2mb",
    },
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
  // Optimize production builds
  swcMinify: true,
  // Reduce bundle size by tree-shaking unused code
  modularizeImports: {
    "framer-motion": {
      transform: "framer-motion/dist/es/{{member}}",
    },
    "lucide-react": {
      transform: "lucide-react/dist/esm/icons/{{kebabCase member}}",
    },
  },
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
      // Static assets - aggressive caching
      {
        source: "/static/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      // Images - long cache
      {
        source: "/:path*.{jpg,jpeg,png,gif,webp,avif,svg,ico}",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
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
          // Add Content-Security-Policy for better security
          {
            key: "Content-Security-Policy",
            value:
              "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://plausible.io https://vercel.live; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://*.supabase.co https://plausible.io https://vercel.live wss://*.supabase.co; frame-src https://giscus.app https://codesandbox.io;",
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
            value: "public, max-age=60, s-maxage=60, stale-while-revalidate=300",
          },
        ],
      },
    ];
  },
};

const withMDX = createMDX();

export default withMDX(nextConfig);
