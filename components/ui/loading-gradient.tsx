import * as React from "react";
import { useEffect } from "react";
import { cn } from "@/lib/utils";

export interface LoadingGradientProps
  extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode;
}

// CSS @property definition - adds to document only once
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
    } catch (error) {
      // Property may already be registered, which throws an error
      console.debug("CSS Property registration:", error);
    }
  }
};

const LoadingGradient = React.forwardRef<HTMLSpanElement, LoadingGradientProps>(
  ({ className, children, ...props }, ref) => {
    useEffect(() => {
      registerCSSProperty();
    }, []);

    return (
      <span
        ref={ref}
        className={cn("shimmer-text inline-block", className)}
        style={{
          // Define gradient using the CSS property
          background: "linear-gradient(to right, #4a5568, white, #4a5568)",
          backgroundSize: "200% 100%",
          backgroundPosition: "var(--shimmer-position, 0%) 0%",
          backgroundClip: "text",
        }}
        {...props}
      >
        <style jsx global>{`
          @property --shimmer-position {
            syntax: "<percentage>";
            initial-value: 0%;
            inherits: false;
          }

          .shimmer-text {
            animation: shimmer-property 2s ease-in-out infinite;
            background-clip: text;
            -webkit-background-clip: text;
            color: transparent;
            -webkit-text-fill-color: transparent;
          }

          @keyframes shimmer-property {
            0% {
              --shimmer-position: -100%;
            }
            100% {
              --shimmer-position: 100%;
            }
          }
        `}</style>
        {children}
      </span>
    );
  },
);
LoadingGradient.displayName = "LoadingGradient";

export { LoadingGradient };
