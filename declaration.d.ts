declare module "baseline-status";

// Web Audio API type declarations for webkit prefixed API
declare global {
  interface Window {
    webkitAudioContext: typeof AudioContext;
  }

  namespace JSX {
    interface IntrinsicElements {
      "baseline-status": React.DetailedHTMLProps<
        { featureid: string } & React.HTMLAttributes<HTMLElement>,
        HTMLElement
      >;
    }
  }
}

export {};
