import React, { HTMLAttributes } from "react";
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
        className,
      )}
      style={{
        // Use content-visibility for better rendering performance
        // This tells the browser it can skip rendering off-screen content
        contentVisibility: "auto",
        // Provide a contain-intrinsic-size hint for layout stability
        containIntrinsicSize: "auto 240px",
        ...props.style,
      }}
      {...props}
    >
      {containerContent}
    </div>
  );
};
