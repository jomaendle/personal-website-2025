import { Link } from "next-view-transitions";
import { ThemeToggle } from "@/components/theme-toggle";
import { SITE } from "@/lib/config/site";
import { PRIMARY_NAV } from "@/lib/config/navigation";

/**
 * PageTopBar — Editorial design layer.
 *
 * Shared top bar used by the /blog, /about and /business routes: a mono
 * "← back" link on the left and the ThemeToggle on the right. Defaults to the
 * homepage and the site name; pass `backHref` / `label` to override.
 *
 * `trailing` renders immediately before the ThemeToggle — /business hangs its
 * DE/EN language switch there. Callers that omit it are unaffected.
 */

export function PageTopBar({
  backHref = "/",
  label = SITE.name,
  trailing,
  currentPath,
}: {
  backHref?: string;
  label?: string;
  trailing?: React.ReactNode;
  /** Route of the page rendering this bar, so its own nav entry is omitted. */
  currentPath?: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <Link
        href={backHref}
        className="font-mono text-sm tracking-[0.04em] text-muted-foreground transition-colors hover:text-brand"
      >
        ← {label}
      </Link>
      <div className="flex items-center gap-4">
        {/* Primary nav so /business is reachable from every route, not just the
            homepage masthead. The current page is dropped so the bar never
            links to itself. Hidden on the narrowest screens where the back
            link plus trailing slot already fill the row. */}
        <nav
          aria-label="Primary"
          className="hidden items-center gap-5 text-sm text-muted-foreground sm:flex"
        >
          {PRIMARY_NAV.filter((item) => item.href !== currentPath).map(
            (item) => (
              <Link
                key={item.href}
                href={item.href}
                className="inline-flex min-h-[44px] items-center transition-colors hover:text-brand"
              >
                {item.label}
              </Link>
            ),
          )}
        </nav>
        {trailing}
        <ThemeToggle />
      </div>
    </div>
  );
}
