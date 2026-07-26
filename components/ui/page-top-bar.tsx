import { Link } from "next-view-transitions";
import { ThemeToggle } from "@/components/theme-toggle";
import { SITE } from "@/lib/config/site";

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
}: {
  backHref?: string;
  label?: string;
  trailing?: React.ReactNode;
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
        {trailing}
        <ThemeToggle />
      </div>
    </div>
  );
}
