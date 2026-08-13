import type { MDXComponents } from "mdx/types";
import { Link } from "next-view-transitions";
import { HeadingWithAnchor } from "@/components/ui/heading-with-anchor";

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    h1: ({ children, ...props }) => {
      return (
        <h1 className="mb-8 font-normal tracking-tight" {...props}>
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
    /**
     * Wide tables scroll instead of clipping. `pre` already gets this from
     * `.prose pre`; tables had no equivalent, so a four-column table lost its
     * right-hand columns below ~400px. `tabIndex` is what makes the scroll
     * container reachable by keyboard — without it a keyboard-only reader can
     * see the overflow but never scroll it — and `role="region"` gives that
     * tab stop a name in the accessibility tree.
     */
    table: ({ children, ...props }) => (
      <section
        // biome-ignore lint/a11y/noNoninteractiveTabindex: the tab stop is the point — a keyboard-only reader can't scroll the overflow container without it, and the aria-label names it (WAI scrollable-region pattern)
        tabIndex={0}
        aria-label="Table"
        className="overflow-x-auto focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        <table {...props}>{children}</table>
      </section>
    ),
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
