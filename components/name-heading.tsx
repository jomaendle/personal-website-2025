import Image from "next/image";
import { Link } from "next-view-transitions";
import { ThemeToggle } from "@/components/theme-toggle";
import { H1 } from "@/components/ui/heading";
import { PRIMARY_NAV } from "@/lib/config/navigation";
import { SITE } from "@/lib/config/site";

/**
 * NameHeading — the homepage masthead.
 *
 * A brand row (nav plus theme toggle), then the avatar beside the name and
 * role. Identity comes from `lib/config/site.ts`, nav from
 * `lib/config/navigation.ts`.
 *
 * The nav renders inline at every width. It used to collapse into a menu
 * button below `sm`, backed by a Radix Collapsible: tapping it pushed the
 * avatar, the name and the whole page down by the height of the panel, and the
 * panel itself was two text links under a hairline, left-aligned beneath a
 * right-aligned button. For two links that is a disclosure widget nobody needs.
 * Both links plus the toggle measure 173px against 252px of content width at
 * 320px, the narrowest phone worth supporting, so they simply fit. This also
 * matches `PageTopBar`, which has always shown the same links inline on mobile.
 *
 * Dropping the menu left no state and no refs behind, so this is a server
 * component now and the homepage ships that much less JavaScript.
 */

export const NameHeading = ({
  showJobTitle,
  jobTitle = SITE.role,
}: {
  showJobTitle?: boolean;
  jobTitle?: string;
}) => {
  return (
    <div className="flex flex-col gap-5 sm:gap-6">
      <div className="flex items-center justify-end gap-5">
        <nav
          aria-label="Primary"
          className="flex items-center gap-5 text-muted-foreground text-sm"
        >
          {PRIMARY_NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              // min-h-[44px] for the WCAG 2.5.8 tap target, the same way
              // PageTopBar sizes these links.
              className="inline-flex min-h-[44px] items-center transition-colors hover:text-brand focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <ThemeToggle />
      </div>

      <div className="flex items-center gap-5">
        <Image
          src={SITE.avatar}
          alt={SITE.name}
          width={96}
          height={96}
          priority
          className="size-20 rounded-full bg-neutral-100 object-cover md:size-24 dark:bg-neutral-800"
        />
        <div className="flex flex-col gap-1.5">
          <H1>{SITE.name}</H1>
          {/* The role sits under the name in body type. It used to be a mono
              uppercase brand eyebrow in the top bar, where it competed with the
              nav and read as a section label rather than as who this is. */}
          {showJobTitle ? (
            <p className="text-muted-foreground">{jobTitle}</p>
          ) : null}
        </div>
      </div>
    </div>
  );
};
