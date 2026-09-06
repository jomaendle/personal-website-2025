import { H3 } from "@/components/ui/heading";

const jobPositions = [
  {
    company: "E.ON Digital Technology",
    role: "Principal Solution Architect",
    startDate: "Sep 2024",
    endDate: "present",
  },
  {
    company: "Memberspot",
    role: "Frontend Engineer",
    startDate: "Aug 2023",
    endDate: "Jul 2024",
  },
  {
    company: "StudySmarter",
    role: "Frontend Engineer",
    startDate: "Oct 2021",
    endDate: "Jul 2023",
  },
  {
    company: "Micro Focus",
    role: "Frontend Engineer",
    startDate: "Oct 2019",
    endDate: "Nov 2021",
  },
];

export const JobPositions = () => {
  return (
    <div className="flex flex-col gap-6">
      {jobPositions.map((position) => (
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
