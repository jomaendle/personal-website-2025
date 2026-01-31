import type { DetailedHTMLProps, HTMLAttributes } from "react";

declare module "baseline-status";

// Web Audio API type declarations for webkit prefixed API
declare global {
  interface Window {
    webkitAudioContext: typeof AudioContext;
  }
}

// React 19 requires module augmentation for custom elements
// instead of global JSX namespace declaration
declare module "react/jsx-runtime" {
  namespace JSX {
    interface IntrinsicElements {
      "baseline-status": DetailedHTMLProps<
        HTMLAttributes<HTMLElement> & { featureid: string },
        HTMLElement
      >;
    }
  }
}

export {};
