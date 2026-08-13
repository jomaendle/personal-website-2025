import { cn } from "@/lib/utils";

/**
 * Heading primitives — Editorial design layer.
 *
 * Same exports (BlogH1, H1, H2, H3) and props as the original, so every
 * consumer keeps working. Only the presentation changes:
 *   · H1  — large Newsreader serif (name / page titles)
 *   · H2  — Geist Mono uppercase label in brand vermilion (section eyebrow)
 *   · H3  — Newsreader serif item title, brand hover opt-out via `interactive`
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
        "mb-8 text-balance font-normal font-serif text-[clamp(2rem,5vw,3.25rem)] leading-[1.04] tracking-[-0.015em]",
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
        "mb-1 font-normal font-serif text-[clamp(1.9rem,4vw,2.75rem)] leading-[1.02] tracking-[-0.015em]",
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
        "mb-6 font-mono text-brand text-xs uppercase tracking-[0.16em]",
        props.className,
      )}
    >
      {children}
    </h2>
  );
};

const H3 = ({
  children,
  interactive = true,
  as: Tag = "h3",
  ...props
}: {
  children: React.ReactNode;
  /**
   * Whether the title picks up the brand colour from an ancestor `.group`
   * hover. Defaults to `true` because most H3s are the title of a link row.
   * Pass `interactive={false}` for a standalone heading that nothing wraps.
   */
  interactive?: boolean;
  /**
   * Heading level, when the type is right but the depth is not. On `/blog` the
   * post titles sit directly under the page `h1`, so shipping them as `h3`
   * would skip a level; on the homepage the same rows sit under a section `h2`
   * and `h3` is correct. Type stays identical either way.
   */
  as?: "h2" | "h3";
} & React.HTMLAttributes<HTMLHeadingElement>) => {
  return (
    <Tag
      {...props}
      className={cn(
        "font-normal font-serif text-[1.35rem] text-foreground leading-[1.15] tracking-[-0.01em]",
        interactive && "transition-colors group-hover:text-brand",
        props.className,
      )}
    >
      {children}
    </Tag>
  );
};

export { BlogH1, H1, H2, H3 };
