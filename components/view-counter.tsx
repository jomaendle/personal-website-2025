"use client";

import NumberFlow from "@number-flow/react";
import { Loader2 } from "lucide-react";
import { useViewCount } from "@/lib/views";

export function ViewCounter({
  slug,
  shouldIncrement,
}: {
  slug: string;
  shouldIncrement?: boolean | undefined;
}) {
  const { views, failed: hasError } = useViewCount(slug, shouldIncrement);

  if (hasError) {
    return <p className="text-muted-foreground text-sm">- views</p>;
  }

  if (views === null) {
    return <Loader2 className="size-4 animate-spin" />;
  }

  return (
    <p className="motion-preset-fade-md flex items-center gap-1 text-muted-foreground text-sm">
      <NumberFlow value={views} /> views
    </p>
  );
}
