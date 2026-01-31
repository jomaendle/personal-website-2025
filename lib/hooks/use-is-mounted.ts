"use client";

import { useEffect, useState } from "react";

/**
 * Hook to detect if component has mounted on the client.
 * Used to prevent SSR/hydration mismatches for client-only features.
 *
 * This pattern is recommended by React for handling hydration:
 * https://react.dev/reference/react-dom/client/hydrateRoot#handling-different-client-and-server-content
 */
export function useIsMounted(): boolean {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // This is the recommended React pattern for handling hydration mismatches.
    // There is no alternative - effects are the only way to detect client-side mounting.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMounted(true);
  }, []);

  return isMounted;
}
