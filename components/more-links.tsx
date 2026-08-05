"use client";

import { Link } from "next-view-transitions";
import { motion, type Variants } from "framer-motion";
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

const containerVariants: Variants = {
  hidden: { opacity: 1 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, x: -10 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.3,
      ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number],
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
      // Rows carry their own padding to reach a 44px target, so the old gap is
      // gone. `items-start` keeps each hit area to the width of its own label
      // instead of the full column, and `sm:flex-row sm:flex-wrap` puts these
      // five short links back on one line at desktop widths — stacked, they
      // left ~85% of the row empty next to the full-width ledger above.
      className="flex flex-col items-start sm:flex-row sm:flex-wrap sm:gap-x-8"
    >
      {links.map((link) => (
        <motion.div key={link.href} variants={itemVariants}>
          <MotionLink
            href={link.href}
            // `py-2.5` takes the 24px text row to a 44px pointer target
            // (WCAG 2.5.8) without touching the type size.
            className="group inline-flex items-center gap-1 py-2.5 text-muted-foreground transition-colors hover:text-brand"
            target={link.href.startsWith("mailto:") ? undefined : "_blank"}
            rel={
              link.href.startsWith("mailto:")
                ? undefined
                : "noopener noreferrer"
            }
            whileHover={{ x: 4 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
          >
            <span>{link.text}</span>
            <ArrowUpRight className="size-3 opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100" />
            {!link.href.startsWith("mailto:") && (
              <span className="sr-only"> (opens in new window)</span>
            )}
          </MotionLink>
        </motion.div>
      ))}
    </motion.div>
  );
};
