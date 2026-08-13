import type { RefObject } from "react";
import { cn } from "@/lib/utils";

export const ComponentPreview = ({
  children,
  className,
  ref,
}: {
  children: React.ReactNode;
  className?: string;
  ref?: RefObject<HTMLDivElement | null>;
}) => {
  return (
    <div
      ref={ref}
      className={cn(
        "flex h-[300px] w-full items-center justify-center rounded-sm border border-neutral-800 bg-neutral-950 py-8 md:py-0",
        className,
      )}
    >
      {children}
    </div>
  );
};

ComponentPreview.displayName = "ComponentPreview";
