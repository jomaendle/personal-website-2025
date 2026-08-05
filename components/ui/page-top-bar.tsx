import { Link } from "next-view-transitions";
import { ThemeToggle } from "@/components/theme-toggle";
import { SITE } from "@/lib/config/site";
import { PRIMARY_NAV } from "@/lib/config/navigation";

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
        className="-mx-2 -my-2 mr-auto inline-flex min-h-[44px] items-center px-2 py-2 font-mono text-sm tracking-[0.04em] text-muted-foreground transition-colors hover:text-brand"
      >
        ← {label}
      </Link>
      {/* Primary nav so /business is reachable from every route, not just the
          homepage masthead. The current page is dropped so the bar never links
          to itself. Below `sm` the row cannot hold the back link, the nav, the
          trailing slot and the toggle, so the nav wraps onto its own full-width
          line underneath rather than disappearing. */}
      <nav
        aria-label="Primary"
        className="order-last flex w-full items-center gap-5 text-sm text-muted-foreground sm:order-none sm:w-auto"
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
