"use client";

import { cn } from "@/lib/utils";
import { motion, MotionProps, useScroll } from "motion/react";
import React from "react";

type ScrollProgressProps = Omit<
  React.HTMLAttributes<HTMLElement>,
  keyof MotionProps
>;

export const ScrollProgress = React.forwardRef<
  HTMLDivElement,
  ScrollProgressProps
>(({ className, ...props }, ref) => {
  const { scrollYProgress } = useScroll();

  return (
    <motion.div
      ref={ref}
      className={cn(
        "fixed inset-x-0 top-0 z-[101] h-0.5 origin-left bg-gradient-to-r from-[#A97CF8] via-[#F38CB8] to-[#FDCC92] saturate-[.6]",
        className,
      )}
      style={{
        scaleX: scrollYProgress,
      }}
      {...props}
    />
  );
});

ScrollProgress.displayName = "ScrollProgress";
