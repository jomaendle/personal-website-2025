import { cn } from "@/lib/utils";

/**
 * Heading primitives — Editorial design layer.
 *
 * Same exports (BlogH1, H1, H2, H3) and props as the original, so every
 * consumer keeps working. Only the presentation changes:
 *   · H1  — large Newsreader serif (name / page titles)
 *   · H2  — Geist Mono uppercase label in brand vermilion (section eyebrow)
 *   · H3  — Newsreader serif item title with brand hover
 *   · BlogH1 — serif article title
 *
 * Typography comes from Tailwind tokens (`font-serif`, `font-mono`, `text-brand`)
 * which resolve to `--font-serif` / `--brand` defined in `app/editorial-theme.css`.
 */

const BlogH1 = ({
  children,
  ...props
}: {
  children: React.ReactNode;
} & React.HTMLAttributes<HTMLHeadingElement>) => {
  return (
    <h1
      {...props}
      className={cn(
        "mb-8 font-serif text-[clamp(2rem,5vw,3.25rem)] font-normal leading-[1.04] tracking-[-0.015em] text-balance",
        props.className,
      )}
    >
      {children}
    </h1>
  );
};

const H1 = ({
  children,
  ...props
}: {
  children: React.ReactNode;
} & React.HTMLAttributes<HTMLHeadingElement>) => {
  return (
    <h1
      {...props}
      className={cn(
        "mb-1 font-serif text-[clamp(1.9rem,4vw,2.75rem)] font-normal leading-[1.02] tracking-[-0.015em]",
        props.className,
      )}
    >
      {children}
    </h1>
  );
};

const H2 = ({
  children,
  ...props
}: {
  children: React.ReactNode;
} & React.HTMLAttributes<HTMLHeadingElement>) => {
  return (
    <h2
      {...props}
      className={cn(
        "mb-6 font-mono text-xs uppercase tracking-[0.16em] text-brand",
        props.className,
      )}
    >
      {children}
    </h2>
  );
};

const H3 = ({
  children,
  ...props
}: {
  children: React.ReactNode;
} & React.HTMLAttributes<HTMLHeadingElement>) => {
  return (
    <h3
      {...props}
      className={cn(
        "font-serif text-[1.35rem] font-normal leading-[1.15] tracking-[-0.01em] text-foreground transition-colors group-hover:text-brand",
        props.className,
      )}
    >
      {children}
    </h3>
  );
};

export { H1, H2, H3, BlogH1 };
