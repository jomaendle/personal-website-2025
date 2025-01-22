import type { MDXComponents } from "mdx/types";
import { H2, H3 } from "@/components/ui/heading";

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    h1: ({ children, ...props }) => (
      <h1 className="text-2xl font-normal tracking-tight mb-8" {...props}>
        {children}
      </h1>
    ),
    h2: ({ children, ...props }) => <H2 {...props}>{children}</H2>,
    h3: ({ children, ...props }) => <H3 {...props}>{children}</H3>,
    ...components,
  };
}
