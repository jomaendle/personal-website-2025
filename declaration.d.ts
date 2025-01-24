declare module "baseline-status";

declare namespace JSX {
  interface IntrinsicElements {
    "baseline-status": React.DetailedHTMLProps<
      { featureid: string } & React.HTMLAttributes<HTMLElement>,
      HTMLElement
    >;
  }
}
