"use client";

import { Link } from "next-view-transitions";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";

const links = [
  {
    href: "https://www.linkedin.com/in/johannes-maendle/",
    text: "LinkedIn",
  },
  {
    href: "https://medium.com/@johannes.maendle",
    text: "Medium",
  },
  {
    href: "https://github.com/jomaendle",
    text: "GitHub",
  },
  {
    text: "Unsplash",
    href: "https://unsplash.com/@leonardo_64",
  },
  {
    text: "YouTube",
    href: "https://www.youtube.com/@jo.maendle/videos",
  },
];

const MotionLink = motion.create(Link);

const containerVariants = {
  hidden: { opacity: 1 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: -10 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.3,
      ease: [0.25, 0.1, 0.25, 1],
    },
  },
};

export const MoreLinks = () => {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
      className="flex flex-col gap-2"
    >
      {links.map((link) => (
        <motion.div key={link.href} variants={itemVariants}>
          <MotionLink
            href={link.href}
            className="group inline-flex items-center gap-1 text-muted-foreground transition-colors hover:text-primary"
            target={link.href.startsWith("mailto:") ? undefined : "_blank"}
            rel={
              link.href.startsWith("mailto:") ? undefined : "noopener noreferrer"
            }
            whileHover={{ x: 4 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
          >
            <span>{link.text}</span>
            <ArrowUpRight className="size-3 opacity-0 transition-opacity group-hover:opacity-100" />
          </MotionLink>
        </motion.div>
      ))}
    </motion.div>
  );
};
