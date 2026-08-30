import { Link } from "next-view-transitions";
import { ThemeToggle } from "@/components/theme-toggle";
import { PRIMARY_NAV } from "@/lib/config/navigation";
import { SITE } from "@/lib/config/site";

/**
 * PageTopBar — Editorial design layer.
 *
 * Shared top bar used by the /blog, /about, /business, /impressum, /datenschutz,
 * 404 and error routes: a mono "← back" link on the left and the ThemeToggle on
 * the right. Defaults to the homepage and the site name; pass `backHref` /
 * `label` to override.
 *
 * Renders as `<header>`, so every route that uses it exposes a `banner`
 * landmark. That only holds while the bar sits outside the route's `<main>`;
 * nested inside one, `<header>` carries no implicit role.
 *
 * `trailing` renders immediately before the ThemeToggle — /business hangs its
 * DE/EN language switch there. Callers that omit it are unaffected.
 *
 * One row, on every route and at every width the content allows. The nav used
 * to be forced onto a line of its own below `sm` with `w-full`, which made the
 * subpages look nothing like the homepage masthead and did it even where there
 * was room: at 320px `/blog` needs 223px of the 252px available. What actually
 * did not fit was the back link, 115px of "← Jo Mändle" out of those 252. Below
 * `sm` it is the arrow alone, with the name kept for screen readers, and the
 * whole bar fits on one line down to 320px on every route except /business,
 * which also carries a language switch and wraps below roughly 365px.
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
    <header className="flex flex-wrap items-center gap-x-4 gap-y-1">
      <Link
        href={backHref}
        // -mx-2/-my-2 keep the optical position while the padding lifts the tap
        // target to 44px, matching the nav links and the /business language
        // switch in the same row.
        className="-mx-2 -my-2 mr-auto inline-flex min-h-[44px] min-w-[44px] items-center px-2 py-2 font-mono text-muted-foreground text-sm tracking-[0.04em] transition-colors hover:text-brand"
      >
        <span aria-hidden="true" className="sm:mr-2">
          ←
        </span>
        {/* `sr-only` rather than dropping the text: the link keeps the same
            accessible name at every width, and it is announced once, not twice.
            The margin lives on the arrow because `not-sr-only` resets margin. */}
        <span className="sr-only sm:not-sr-only">{label}</span>
      </Link>
      {/* Primary nav so /business is reachable from every route, not just the
          homepage masthead. The current page is dropped so the bar never links
          to itself. */}
      <nav
        aria-label="Primary"
        className="flex items-center gap-5 text-muted-foreground text-sm"
      >
        {PRIMARY_NAV.filter((item) => item.href !== currentPath).map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="inline-flex min-h-[44px] items-center transition-colors hover:text-brand"
          >
            {item.label}
          </Link>
        ))}
      </nav>
      <div className="flex items-center gap-4">
        {trailing}
        <ThemeToggle />
      </div>
    </header>
  );
}
