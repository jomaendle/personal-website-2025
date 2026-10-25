/** Past and present roles, newest first. Read by the homepage Experience
 * section and by the /iphone page's Contacts card. */
export interface JobPosition {
  company: string;
  role: string;
  startDate: string;
  endDate: string;
}

export const JOB_POSITIONS: JobPosition[] = [
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
