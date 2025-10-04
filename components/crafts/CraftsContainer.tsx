import React, { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import { Link } from "next-view-transitions";
import { ChevronRight } from "lucide-react";

interface CraftsContainerProps extends HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
  innerClassName?: string;
  title?: string;
  link?: string | undefined;
  showFadeOut?: boolean;
}

export const CraftsContainer = ({
  children,
  className,
  innerClassName,
  title,
  link,
  showFadeOut = true,
  ...props
}: CraftsContainerProps) => {
  const containerContent = (
    <div
      className={cn(
        "absolute inset-0 flex flex-1 items-center justify-center bg-transparent",
        innerClassName,
      )}
    >
      {children}
    </div>
  );

  const titleElement = (
    <>
      {title}
      {link && (
        <ChevronRight className="ml-0.5 size-4 text-white/80 transition-transform group-hover:translate-x-1" />
      )}
    </>
  );

  return (
    <div
      className={cn(
        "relative flex h-full min-h-60 w-full items-center justify-center overflow-hidden rounded-lg border",
        className,
      )}
      {...props}
    >
      {containerContent}

      {link && showFadeOut && (
        <Link
          href={link}
          target="_self"
          className="group absolute bottom-0 z-20 flex min-h-20 w-full items-end bg-gradient-to-b from-transparent to-neutral-950 p-3 font-sans text-xs text-white/80 underline"
        >
          {titleElement}
        </Link>
      )}
      {!link && showFadeOut && (
        <div className="group absolute bottom-0 z-20 flex min-h-20 w-full items-end bg-gradient-to-b from-transparent to-neutral-950 p-3 font-sans text-xs text-white/80">
          {titleElement}
        </div>
      )}
    </div>
  );
};
