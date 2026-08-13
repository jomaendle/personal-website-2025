import type * as React from "react";

import { cn } from "@/lib/utils";

const Textarea = ({
  className,
  ref,
  ...props
}: React.ComponentProps<"textarea"> & {
  ref?: React.RefObject<HTMLTextAreaElement | null>;
}) => {
  return (
    <textarea
      className={cn(
        // Mirrors the Input primitive: control boundary on `border-border-strong`
        // (>=3:1) and the brand hairline focus, so a textarea sitting next to an
        // input in the same form reads as the same control.
        "flex min-h-[60px] w-full rounded-md border border-border-strong bg-transparent px-3 py-2 text-base shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:border-brand focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        className,
      )}
      ref={ref}
      {...props}
    />
  );
};
Textarea.displayName = "Textarea";

export { Textarea };
