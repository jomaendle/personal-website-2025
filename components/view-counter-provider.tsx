"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { ViewCounter } from "@/components/view-counter";

export function ViewCounterWithProvider({
  slug,
  shouldIncrement,
}: {
  slug: string;
  shouldIncrement?: boolean;
}) {
  return (
    <QueryClientProvider client={queryClient}>
      <ViewCounter slug={slug} shouldIncrement={shouldIncrement} />
    </QueryClientProvider>
  );
}
