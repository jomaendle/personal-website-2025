import { H1 } from "@/components/ui/heading";
import { ThemeToggle } from "@/components/theme-toggle";

export const NameHeading = ({ showJobTitle }: { showJobTitle?: boolean }) => {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <H1>Jo Mändle</H1>
        {showJobTitle && (
          <p className="text-muted-foreground">Full-Stack Developer</p>
        )}
      </div>
      <ThemeToggle />
    </div>
  );
};
