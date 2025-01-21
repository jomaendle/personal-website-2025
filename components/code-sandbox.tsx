import { cn } from "@/lib/utils";

interface CodeSandboxProps {
  src: string;
  className?: string;
}

export function CodeSandbox({ src, className }: CodeSandboxProps) {
  return (
    <iframe
      src={src}
      className={cn("w-full min-h-[320px]", className)}
      allow="accelerometer; ambient-light-sensor; camera; encrypted-media; geolocation; gyroscope; hid; microphone; midi; payment; usb; vr; xr-spatial-tracking"
      sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
    />
  );
}
