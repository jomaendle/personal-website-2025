import { Link } from "next-view-transitions";
import { cn } from "@/lib/utils";
import { SITE } from "@/lib/config/site";
import { LEGAL_LINKS } from "@/lib/config/navigation";

/**
 * Footer — Editorial design layer.
 *
 * Same `className` prop. A hairline top rule and a serif wordmark to match the
 * editorial system, with brand-colored hover on the legal links. Wordmark from
 * `site.ts`, legal links from `navigation.ts`.
 *
 * Wordmark and legal links only — no primary nav. Navigation lives in
 * `PageTopBar`, and repeating it down here made the footer read as a second
 * menu rather than a sign-off.
 *
 * Render it as a sibling of the route's `<main>`, not inside it: `<footer>`
 * only carries the implicit `contentinfo` role outside sectioning content.
 */

export const Footer = ({ className }: React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <footer
      className={cn(
        "mt-16 flex flex-wrap items-center justify-between gap-x-4 gap-y-3 border-t border-border pt-8 text-xs text-muted-foreground",
        className,
      )}
    >
      <span className="font-serif text-lg text-foreground">{SITE.name}</span>
      <div className="-my-2 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono uppercase tracking-[0.06em]">
        <span>© {SITE.name}</span>
        {LEGAL_LINKS.map((link) => (
          <span key={link.href} className="contents">
            <span aria-hidden="true">·</span>
            {/* -mx-2 keeps the optical spacing while the padding lifts the tap
                target past the 24px minimum; the 12px type stays 12px. */}
            <Link
              href={link.href}
              className="-mx-2 inline-flex min-h-[32px] items-center px-2 transition-colors hover:text-brand"
            >
              {link.label}
            </Link>
          </span>
        ))}
      </div>
    </footer>
  );
};
