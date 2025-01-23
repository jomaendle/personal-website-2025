const jobPositions = [
  {
    company: "E.ON Digital Technology",
    role: "Full Stack Developer",
    startDate: "Sep 2024",
    endDate: "present",
  },
  {
    company: "Memberspot",
    role: "Frontend Developer",
    startDate: "Aug 2023",
    endDate: "Jul 2024",
  },
  {
    company: "StudySmarter",
    role: "Frontend Developer",
    startDate: "Oct 2021",
    endDate: "Jul 2023",
  },
  {
    company: "Micro Focus (now OpenText)",
    role: "Software Developer",
    startDate: "Oct 2019",
    endDate: "Nov 2021",
  },
];

export const JobPositions = () => {
  return (
    <>
      {jobPositions.map((position, index) => (
        <article key={index}>
          <h3 className="text-foreground">{position.company}</h3>
          <p className="text-muted-foreground">{position.role}</p>
          <p className="text-muted-foreground text-xs">
            {position.startDate} — {position.endDate}
          </p>
        </article>
      ))}
    </>
  );
};
