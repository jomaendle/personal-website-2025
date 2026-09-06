import Image from "next/image";
import { Link } from "next-view-transitions";
import { ThemeToggle } from "@/components/theme-toggle";
import { H1 } from "@/components/ui/heading";
import { PRIMARY_NAV } from "@/lib/config/navigation";
import { SITE } from "@/lib/config/site";

/**
 * Homepage masthead: nav and theme toggle, then avatar, name and role.
 * The nav stays inline at every width; two links and a toggle fit at 320px.
 */

export const NameHeading = ({
  showJobTitle,
  jobTitle = SITE.role,
}: {
  showJobTitle?: boolean;
  jobTitle?: string;
}) => {
  return (
    <div className="flex flex-col gap-8 sm:gap-10">
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
          {showJobTitle ? (
            <p className="text-muted-foreground">{jobTitle}</p>
          ) : null}
        </div>
      </div>
    </div>
  );
};
