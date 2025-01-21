import createMDX from "@next/mdx";

/** @type {import('next').NextConfig} */
const nextConfig = {
  pageExtensions: ["mdx", "jsx", "js", "ts", "tsx"],
};

const withMDX = createMDX();

export default withMDX(nextConfig);
