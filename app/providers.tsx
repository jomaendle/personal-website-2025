"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { MotionConfig } from "framer-motion";
import { queryClient } from "@/lib/queryClient";

export function ReactQueryProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <QueryClientProvider client={queryClient}>
      {/* reducedMotion="user" makes every Framer Motion animation respect the
          OS "reduce motion" setting (transforms/layout are skipped, opacity is
          kept). CSS-based animations are handled globally in globals.css. */}
      <MotionConfig reducedMotion="user">{children}</MotionConfig>
    </QueryClientProvider>
  );
}
