import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

// Expand/collapse via a CSS grid-template-rows 0fr -> 1fr transition instead
// of framer animating `height: auto`. The panel stays mounted, so the collapse
// always plays (there's no AnimatePresence exit to lose), nothing is measured
// in JS per frame, and `inert` keeps the hidden content out of the tab order
// and the accessibility tree while closed.
export function CollapsiblePanel({
  id,
  open,
  className,
  children,
}: {
  id?: string;
  open: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      id={id}
      inert={!open}
      className={cn(
        "grid transition-[grid-template-rows,opacity] duration-300 ease-out",
        open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
        className,
      )}
    >
      <div className="min-h-0 overflow-hidden">{children}</div>
    </div>
  );
}
