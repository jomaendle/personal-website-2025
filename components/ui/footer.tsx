import { Link } from "next-view-transitions";
import { cn } from "@/lib/utils";

export const Footer = ({ className }: React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <footer
      className={cn(
        "mt-16 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground",
        className,
      )}
    >
      <p>© Jo Mändle</p>
      <span aria-hidden="true">·</span>
      <Link href="/impressum" className="transition-colors hover:text-primary">
        Impressum
      </Link>
      <span aria-hidden="true">·</span>
      <Link
        href="/datenschutz"
        className="transition-colors hover:text-primary"
      >
        Datenschutz
      </Link>
    </footer>
  );
};
