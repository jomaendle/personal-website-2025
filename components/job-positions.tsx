const jobPositions = [
  {
    company: "E.ON Digital Technology",
    role: "Full-Stack Engineer",
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
    <>
      {jobPositions.map((position, index) => (
        <article key={index} className="flex items-center">
          <div className="flex-1">
            <h3 className="text-foreground">{position.company}</h3>
            <p className="text-muted-foreground">{position.role}</p>
          </div>
          <p className="text-xs text-muted-foreground md:text-sm">
            {position.startDate} — {position.endDate}
          </p>
        </article>
      ))}
    </>
  );
};
