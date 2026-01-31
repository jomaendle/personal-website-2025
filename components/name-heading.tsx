import Image from "next/image";
import { H1 } from "@/components/ui/heading";
import { ThemeToggle } from "@/components/theme-toggle";

export const NameHeading = ({ showJobTitle }: { showJobTitle?: boolean }) => {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="flex items-center gap-4">
        <Image
          src="/avatar.jpeg"
          alt="Jo Mändle"
          width={96}
          height={96}
          priority
          className="size-20 md:size-24 rounded-full"
        />
        <div>
          <H1>Jo Mändle</H1>
          {showJobTitle && (
            <p className="text-muted-foreground">Full-Stack Developer</p>
          )}
        </div>
      </div>
      <ThemeToggle />
    </div>
  );
};
