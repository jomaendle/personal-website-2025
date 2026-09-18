// Explicit reference required under TypeScript 7 (tsgo): unlike tsc 5.x, it
// does not auto-include ambient module declarations from @types packages that
// nothing imports by name — and every react-syntax-highlighter import in this
// codebase is a deep dist/esm path that only exists as an ambient declaration.
/// <reference types="react-syntax-highlighter" />

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

// WebMCP (W3C draft): `toolname` / `tooldescription` on a form declare it as a
// tool an in-browser agent may call. They are plain lowercase attributes, so
// React forwards them into the server-rendered HTML where crawlers can read
// them — but they are not in React's `FormHTMLAttributes`, hence this.
declare module "react" {
  interface FormHTMLAttributes<T> {
    toolname?: string;
    tooldescription?: string;
  }
}
