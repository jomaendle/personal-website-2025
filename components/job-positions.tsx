import { H3 } from "@/components/ui/heading";
import { JOB_POSITIONS } from "@/lib/state/jobs";

export const JobPositions = () => {
  return (
    <div className="flex flex-col gap-6">
      {JOB_POSITIONS.map((position) => (
        <article
          key={`${position.company}-${position.role}`}
          className="flex items-center"
        >
          <div className="flex-1">
            <H3 interactive={false}>{position.company}</H3>
            <p className="text-muted-foreground">{position.role}</p>
          </div>
          <p className="text-muted-foreground text-xs md:text-sm">
            {position.startDate} – {position.endDate}
          </p>
        </article>
      ))}
    </div>
  );
};
