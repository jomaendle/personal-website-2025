"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

interface ThemeAwareBodyProps {
  children: React.ReactNode;
  className?: string;
}

export function ThemeAwareBody({ children, className = "" }: ThemeAwareBodyProps) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent flash of unstyled content
  const backgroundClass = !mounted
    ? "bg-gradient-dark"
    : resolvedTheme === "light"
      ? "bg-gradient-light"
      : "bg-gradient-dark";

  return (
    <body
      className={`${className} ${backgroundClass} min-h-[100dvh] text-foreground`}
    >
      {children}
    </body>
  );
}
