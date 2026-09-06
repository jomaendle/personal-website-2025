import { Link } from "next-view-transitions";
import { LEGAL_LINKS, SOCIAL_LINKS } from "@/lib/config/navigation";
import { SITE } from "@/lib/config/site";
import { cn } from "@/lib/utils";

/**
 * Wordmark, profiles elsewhere, and the legal links. No primary nav: that is
 * the top bar's job.
 *
 * Render it as a sibling of the route's `<main>`, not inside it: `<footer>`
 * only carries the implicit `contentinfo` role outside sectioning content.
 * No top margin of its own; the `.glass-container` spaces its children.
 */

/** Baked in at build time; every route rendering the footer is static. */
const YEAR = new Date().getFullYear();

const LINK_CLASS =
  "-mx-2 inline-flex min-h-[32px] items-center px-2 transition-colors hover:text-brand";

export const Footer = ({ className }: React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <footer
      className={cn(
        "flex flex-col gap-5 border-border border-t pt-8 text-muted-foreground text-xs",
        className,
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
        <span className="font-serif text-foreground text-lg">{SITE.name}</span>
        <ul className="-my-2 flex flex-wrap items-center gap-x-5 font-mono uppercase tracking-[0.06em]">
          {SOCIAL_LINKS.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className={LINK_CLASS}
              >
                {link.label}
                <span className="sr-only"> (opens in new window)</span>
              </a>
            </li>
          ))}
        </ul>
      </div>
      <div className="-my-2 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono uppercase tracking-[0.06em]">
        <span>© {YEAR}</span>
        {LEGAL_LINKS.map((link) => (
          <span key={link.href} className="contents">
            <span aria-hidden="true">·</span>
            <Link
              href={link.href}
              hrefLang={link.hrefLang}
              className={LINK_CLASS}
            >
              {link.label}
            </Link>
          </span>
        ))}
      </div>
    </footer>
  );
};
