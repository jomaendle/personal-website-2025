import type React from "react";
import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface CraftsContainerProps extends HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
  innerClassName?: string;
}

export const CraftsContainer = ({
  children,
  className,
  innerClassName,
  ...props
}: CraftsContainerProps) => {
  const containerContent = (
    <div
      className={cn(
        "absolute inset-0 flex flex-1 items-center justify-center overflow-hidden bg-transparent",
        innerClassName,
      )}
    >
      {children}
    </div>
  );

  return (
    <div
      className={cn(
        "relative flex h-full min-h-60 w-full items-center justify-center overflow-hidden rounded-lg border",
        // The craft inside fills the card, so keyboard focus rings the card itself.
        "has-focus-visible:ring-2 has-focus-visible:ring-brand has-focus-visible:ring-offset-2 has-focus-visible:ring-offset-background",
        className,
      )}
      {...props}
    >
      {containerContent}
    </div>
  );
};
