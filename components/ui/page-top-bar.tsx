import { Link } from "next-view-transitions";
import { ThemeToggle } from "@/components/theme-toggle";
import { SITE } from "@/lib/config/site";

/**
 * PageTopBar — Editorial design layer.
 *
 * Shared top bar used by the /blog and /about routes: a mono "← back" link on
 * the left and the ThemeToggle on the right. Defaults to the homepage and the
 * site name; pass `backHref` / `label` to override.
 */

export function PageTopBar({
  backHref = "/",
  label = SITE.name,
}: {
  backHref?: string;
  label?: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <Link
        href={backHref}
        className="font-mono text-sm tracking-[0.04em] text-muted-foreground transition-colors hover:text-brand"
      >
        ← {label}
      </Link>
      <ThemeToggle />
    </div>
  );
}
