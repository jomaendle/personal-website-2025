import React, { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

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
        className,
      )}
      {...props}
    >
      {containerContent}
    </div>
  );
};
