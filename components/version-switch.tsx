import { Link } from "next-view-transitions";

/**
 * The masthead's switch between the site and its iOS version: a small
 * segmented control in the mono eyebrow style, with the side you're on
 * filled in. On the site it's a link to /ios; the phone has its own way
 * back (the jomaendle.com link in its frame).
 */
export function VersionSwitch() {
  return (
    <Link
      href="/ios"
      aria-label="Open the iOS version of this site"
      // The visual pill is 28px tall; the `after` pseudo-element extends the
      // pointer target to 44px (WCAG 2.5.8), as the theme toggle does.
      className="group relative inline-flex items-center rounded-full border border-border p-0.5 font-mono text-[11px] uppercase tracking-[0.08em] transition-colors after:absolute after:inset-x-0 after:top-1/2 after:h-11 after:-translate-y-1/2 after:content-[''] hover:border-brand/60 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-background"
    >
      <span
        aria-hidden="true"
        className="rounded-full bg-foreground px-2.5 py-1 text-background"
      >
        Web
      </span>
      <span
        aria-hidden="true"
        className="px-2.5 py-1 text-muted-foreground transition-colors group-hover:text-brand"
      >
        iOS
      </span>
    </Link>
  );
}
