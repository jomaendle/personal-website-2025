"use client";

import { motion } from "framer-motion";

const jobPositions = [
  {
    company: "E.ON Digital Technology",
    role: "Senior Full-Stack Engineer",
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

const containerVariants = {
  hidden: { opacity: 1 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.25, 0.1, 0.25, 1],
    },
  },
};

export const JobPositions = () => {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
      className="flex flex-col gap-6"
    >
      {jobPositions.map((position, index) => (
        <motion.article
          key={index}
          variants={itemVariants}
          className="flex items-center"
        >
          <div className="flex-1">
            <h3 className="text-foreground">{position.company}</h3>
            <p className="text-muted-foreground">{position.role}</p>
          </div>
          <p className="text-xs text-muted-foreground md:text-sm">
            {position.startDate} — {position.endDate}
          </p>
        </motion.article>
      ))}
    </motion.div>
  );
};
