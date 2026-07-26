import { Link } from "next-view-transitions";
import { cn } from "@/lib/utils";
import { SITE } from "@/lib/config/site";
import { LEGAL_LINKS, PRIMARY_NAV } from "@/lib/config/navigation";

/**
 * Footer — Editorial design layer.
 *
 * Same `className` prop. A hairline top rule and a serif wordmark to match the
 * editorial system, with brand-colored hover on the legal links. Wordmark from
 * `site.ts`, legal links from `navigation.ts`.
 */

export const Footer = ({ className }: React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <footer
      className={cn(
        "mt-16 flex flex-wrap items-center justify-between gap-x-4 gap-y-3 border-t border-border pt-8 text-xs text-muted-foreground",
        className,
      )}
    >
      <div className="flex flex-col gap-3">
        <span className="font-serif text-lg text-foreground">{SITE.name}</span>
        {/* Primary nav repeated here so every route — including on mobile,
            where the top bar hides its nav — has a path to /business. */}
        <nav
          aria-label="Footer"
          className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs"
        >
          {PRIMARY_NAV.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="inline-flex min-h-[32px] items-center transition-colors hover:text-brand"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono uppercase tracking-[0.06em]">
        <span>© {SITE.name}</span>
        {LEGAL_LINKS.map((link) => (
          <span key={link.href} className="contents">
            <span aria-hidden="true">·</span>
            <Link
              href={link.href}
              className="transition-colors hover:text-brand"
            >
              {link.label}
            </Link>
          </span>
        ))}
      </div>
    </footer>
  );
};
