import { H1 } from "@/components/ui/heading";

export const NameHeading = ({ showJobTitle }: { showJobTitle?: boolean }) => {
  return (
    <>
      <H1>Jo Mändle</H1>
      {showJobTitle && (
        <p className="text-muted-foreground">Full-Stack Developer</p>
      )}
    </>
  );
};
