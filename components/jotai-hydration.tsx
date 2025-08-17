"use client";

import { useEffect, useState } from "react";

interface JotaiHydrationProps {
  children: React.ReactNode;
}

export function JotaiHydration({ children }: JotaiHydrationProps) {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    // Just wait for client-side hydration to complete
    setIsHydrated(true);
  }, []);

  // Prevent hydration mismatch by not rendering until client-side
  // This allows atomWithStorage to work properly with localStorage
  if (!isHydrated) {
    return null;
  }

  return <>{children}</>;
}
