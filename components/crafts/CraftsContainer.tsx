import type React from "react";
import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface CraftsContainerProps
  extends Omit<HTMLAttributes<HTMLElement>, "title"> {
  children?: React.ReactNode;
  /** Rendered as the caption. Previously this was passed as `title`, which
   *  spread onto the div and became a browser tooltip nobody ever saw. */
  title?: string;
  blurb?: string;
  credit?: string;
  innerClassName?: string;
}

export const CraftsContainer = ({
  children,
  title,
  blurb,
  credit,
  className,
  innerClassName,
  ...props
}: CraftsContainerProps) => {
  return (
    <figure className="m-0 flex flex-col gap-3" {...props}>
      <div
        className={cn(
          "relative flex h-full min-h-60 w-full items-center justify-center overflow-hidden rounded-lg border",
          // The craft inside fills the card, so keyboard focus rings the card itself.
          "has-focus-visible:ring-2 has-focus-visible:ring-brand has-focus-visible:ring-offset-2 has-focus-visible:ring-offset-background",
          className,
        )}
      >
        <div
          className={cn(
            "absolute inset-0 flex flex-1 items-center justify-center overflow-hidden bg-transparent",
            innerClassName,
          )}
        >
          {children}
        </div>
      </div>

      {title ? (
        <figcaption className="flex flex-col gap-1.5">
          <span className="font-mono text-brand text-xs uppercase tracking-wider">
            {title}
          </span>
          {blurb ? (
            <p className="max-w-[60ch] text-[0.95rem] text-muted-foreground leading-relaxed">
              {blurb}
            </p>
          ) : null}
          {credit ? (
            <p className="font-mono text-muted-foreground/70 text-xs">
              {credit}
            </p>
          ) : null}
        </figcaption>
      ) : null}
    </figure>
  );
};
