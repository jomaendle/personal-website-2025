import * as React from "react";
import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

export interface LoadingGradientProps
  extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode;
}

// Global flag to track if CSS has been injected
let shimmerStylesInjected = false;

// Inject CSS styles once globally
const injectShimmerStyles = () => {
  if (shimmerStylesInjected || typeof document === "undefined") return;

  const styleSheet = document.createElement("style");
  styleSheet.textContent = `
    @property --shimmer-position {
      syntax: "<percentage>";
      initial-value: 0%;
      inherits: false;
    }

    .shimmer-text {
      animation: shimmer-property 2s ease-in-out infinite;
      background-clip: text !important;
      -webkit-background-clip: text;
      color: transparent;
      -webkit-text-fill-color: transparent;
      background: linear-gradient(to right, #4a5568, white, #4a5568);
      background-size: 200% 100%;
      background-position: var(--shimmer-position, 0%) 0%;
    }

    @keyframes shimmer-property {
      0% {
        --shimmer-position: -100%;
      }
      100% {
        --shimmer-position: 100%;
      }
    }
  `;

  document.head.appendChild(styleSheet);
  shimmerStylesInjected = true;
};

// CSS @property registration for browsers that support it
const registerCSSProperty = () => {
  if (
    typeof window !== "undefined" &&
    "CSS" in window &&
    CSS.registerProperty
  ) {
    try {
      CSS.registerProperty({
        name: "--shimmer-position",
        syntax: "<percentage>",
        initialValue: "0%",
        inherits: false,
      });
    } catch {
      // Property may already be registered, silently ignore
    }
  }
};

const LoadingGradient = React.forwardRef<HTMLSpanElement, LoadingGradientProps>(
  ({ className, children, ...props }, ref) => {
    const initRef = useRef(false);

    useEffect(() => {
      if (!initRef.current) {
        injectShimmerStyles();
        registerCSSProperty();
        initRef.current = true;
      }
    }, []);

    return (
      <span
        ref={ref}
        className={cn("shimmer-text inline-block", className)}
        {...props}
      >
        {children}
      </span>
    );
  },
);
LoadingGradient.displayName = "LoadingGradient";

export { LoadingGradient };
