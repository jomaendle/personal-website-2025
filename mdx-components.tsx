import type { MDXComponents } from "mdx/types";
import { H2, H3 } from "@/components/ui/heading";
import { Link } from "next-view-transitions";

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    h1: ({ children, ...props }) => (
      <h1 className="mb-8 text-2xl font-normal tracking-tight" {...props}>
        {children}
      </h1>
    ),
    h2: ({ children, ...props }) => <H2 {...props}>{children}</H2>,
    h3: ({ children, ...props }) => <H3 {...props}>{children}</H3>,
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
