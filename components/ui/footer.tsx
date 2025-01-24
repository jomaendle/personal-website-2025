import { cn } from "@/lib/utils";

export const Footer = ({ className }: React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <footer className={cn("mt-16 text-xs text-muted-foreground", className)}>
      <p>© Jo Mändle</p>
    </footer>
  );
};
