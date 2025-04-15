import { forwardRef } from "react";
import { cn } from "@/lib/utils";

export const ComponentPreview = forwardRef<
  HTMLDivElement,
  { children: React.ReactNode; classList?: string; onHover?: () => void }
>(({ children, classList }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "flex h-[300px] w-full items-center justify-center rounded-sm border border-neutral-800 bg-neutral-950 py-8 md:py-0",
        classList,
      )}
    >
      {children}
    </div>
  );
});

ComponentPreview.displayName = "ComponentPreview";
