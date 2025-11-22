import type { MDXComponents } from "mdx/types";
import { HeadingWithAnchor } from "@/components/ui/heading-with-anchor";
import { Link } from "next-view-transitions";

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    h1: ({ children, ...props }) => {
      return (
        <h1
          className="blog-title mb-8 font-[display] text-2xl font-normal tracking-tight"
          {...props}
        >
          {children}
        </h1>
      );
    },
    h2: ({ children, ...props }) => (
      <HeadingWithAnchor level={2} {...props}>
        {children}
      </HeadingWithAnchor>
    ),
    h3: ({ children, ...props }) => (
      <HeadingWithAnchor level={3} {...props}>
        {children}
      </HeadingWithAnchor>
    ),
    del: ({ children }) => <del className="line-through">{children}</del>,
    a: ({ href, children }) => {
      if (typeof href !== "string") {
        return null;
      }

      const isExternal = href.startsWith("http") || href.startsWith("//");

      if (isExternal) {
        return (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="!important text-link hover:text-link-hover"
          >
            {children}
          </a>
        );
      }

      return (
        <Link href={href} className="text-link hover:text-link-hover">
          {children}
        </Link>
      );
    },
    ...components,
  };
}
