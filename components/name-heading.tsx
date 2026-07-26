"use client";
import Image from "next/image";
import { Link } from "next-view-transitions";
import { H1 } from "@/components/ui/heading";
import { ThemeToggle } from "@/components/theme-toggle";
import { useRef, useState } from "react";
import { Menu, X } from "lucide-react";
import * as Collapsible from "@radix-ui/react-collapsible";
import { SITE } from "@/lib/config/site";
import { PRIMARY_NAV } from "@/lib/config/navigation";

/**
 * NameHeading — Editorial design layer.
 *
 * Same props (showJobTitle, jobTitle). Reworked as an editorial masthead: a
 * brand eyebrow, large serif name (via H1), and an "available for work" status
 * chip. Identity comes from `lib/config/site.ts`, nav from
 * `lib/config/navigation.ts`. Avatar and ThemeToggle are preserved.
 */

export const NameHeading = ({
  showJobTitle,
  jobTitle = SITE.role,
}: {
  showJobTitle?: boolean;
  jobTitle?: string;
}) => {
  const imageRef = useRef<HTMLImageElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="flex flex-col gap-6">
      <Collapsible.Root
        open={menuOpen}
        onOpenChange={setMenuOpen}
        className="flex flex-col gap-4"
      >
        <div className="flex items-center justify-end gap-4">
          <div className="flex items-center gap-5">
            <nav
              aria-label="Primary"
              className="hidden items-center gap-5 text-sm text-muted-foreground sm:flex"
            >
              {PRIMARY_NAV.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="transition-colors hover:text-brand"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
            <ThemeToggle />
            <Collapsible.Trigger asChild>
              <button
                type="button"
                aria-label={menuOpen ? "Close menu" : "Open menu"}
                className="inline-flex size-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand sm:hidden"
              >
                {menuOpen ? (
                  <X className="size-5" />
                ) : (
                  <Menu className="size-5" />
                )}
              </button>
            </Collapsible.Trigger>
          </div>
        </div>
        <Collapsible.Content className="sm:hidden">
          <nav
            aria-label="Primary"
            className="flex flex-col gap-3 border-t border-border pt-4 text-sm text-muted-foreground"
          >
            {PRIMARY_NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className="transition-colors hover:text-brand"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </Collapsible.Content>
      </Collapsible.Root>

      <div className="flex items-center gap-5">
        <Image
          src={SITE.avatar}
          alt={SITE.name}
          ref={imageRef}
          width={96}
          height={96}
          priority
          className="size-20 rounded-full bg-neutral-100 object-cover dark:bg-neutral-800 md:size-24"
        />
        <div className="flex flex-col gap-1.5">
          <H1>{SITE.name}</H1>
          {/* The role sits under the name in body type. It used to be a mono
              uppercase brand eyebrow in the top bar, where it competed with the
              nav and read as a section label rather than as who this is. */}
          {showJobTitle && (
            <p className="text-muted-foreground">{jobTitle}</p>
          )}
          {showJobTitle && SITE.availableForWork && (
            <span className="mt-0.5 inline-flex w-fit items-center gap-2 text-sm text-muted-foreground">
              <span className="inline-block size-[7px] animate-pulse rounded-full bg-emerald-500" />
              Available for work
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
