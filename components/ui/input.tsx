import type * as React from "react";

import { cn } from "@/lib/utils";

const Input = ({
  className,
  type,
  ref,
  ...props
}: React.ComponentProps<"input"> & {
  ref?: React.RefObject<HTMLInputElement | null>;
}) => {
  return (
    <input
      type={type}
      className={cn(
        // Control boundary uses `border-border-strong` (>=3:1), and focus is
        // the brand hairline used by the /business inquiry form, so every
        // field on the site resolves to one focus system.
        "flex h-10 w-full rounded-md border border-border-strong bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:font-medium file:text-foreground file:text-sm placeholder:text-muted-foreground placeholder:text-sm focus-visible:border-brand focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        className,
      )}
      ref={ref}
      {...props}
    />
  );
};
Input.displayName = "Input";

export { Input };
