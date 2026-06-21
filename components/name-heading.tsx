"use client";
import Image from "next/image";
import { Link } from "next-view-transitions";
import { H1 } from "@/components/ui/heading";
import { ThemeToggle } from "@/components/theme-toggle";
import { useRef } from "react";
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

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <span className="inline-flex items-center gap-2 font-mono text-[0.72rem] uppercase tracking-[0.16em] text-brand">
          {jobTitle}
        </span>
        <div className="flex items-center gap-5">
          <nav className="hidden items-center gap-5 text-sm text-muted-foreground sm:flex">
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
        </div>
      </div>

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
        <div className="flex flex-col gap-2">
          <H1>{SITE.name}</H1>
          {showJobTitle && SITE.availableForWork && (
            <span className="inline-flex w-fit items-center gap-2 text-sm text-muted-foreground">
              <span className="inline-block size-[7px] animate-pulse rounded-full bg-emerald-500" />
              Available for work
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
