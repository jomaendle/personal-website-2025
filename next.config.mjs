import createMDX from "@next/mdx";

/** @type {import('next').NextConfig} */
const nextConfig = {
  pageExtensions: ["mdx", "jsx", "js", "ts", "tsx"],
  experimental: {
    viewTransition: true,
  },
};

const withMDX = createMDX();

export default withMDX(nextConfig);
