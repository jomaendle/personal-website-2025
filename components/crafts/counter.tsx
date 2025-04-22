import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/button";

// The container variants for the whole number
const containerVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { when: "beforeChildren" } },
  exit: { opacity: 0, transition: { when: "afterChildren" } },
};

export const CounterCraft = () => {
  const [counter, setCounter] = useState(0);
  const prevCounterRef = useRef(0);

  // Update previous counter after render
  useEffect(() => {
    prevCounterRef.current = counter;
  }, [counter]);

  const increment = () => {
    if (counter >= 10) {
      return;
    }
    setCounter((c) => c + 1);
  };

  const decrement = () => {
    if (counter <= 0) {
      return;
    }
    setCounter((c) => c - 1);
  };

  // Calculate direction based on counter change
  const direction = counter - prevCounterRef.current;

  // Dynamic variants based on direction
  const getVariants = () => ({
    initial: {
      y: direction >= 0 ? "-100%" : "100%",
      opacity: 0.5,
    },
    animate: {
      y: "0%",
      opacity: 1,
    },
    exit: {
      y: direction >= 0 ? "100%" : "-100%",
      opacity: 0.5,
    },
  });

  const digits = String(counter).split("");

  return (
    <div
      style={{ fontSize: "2rem" }}
      className="flex h-full min-h-60 w-full items-center justify-center gap-6 rounded-lg border font-mono"
    >
      <Button onClick={decrement} disabled={counter === 0} className="h-8 w-8">
        -
      </Button>
      <AnimatePresence mode="popLayout" initial={false}>
        {/* key on the numeric value */}
        <motion.div
          key={counter}
          variants={containerVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          className="flex w-10 justify-center"
        >
          {digits.map((digit, i) => (
            <motion.span
              key={i}
              variants={getVariants()}
              transition={{ duration: 0.2, type: "spring" }}
              className="relative inline-block h-12 w-5 overflow-hidden"
              style={{ textAlign: "center" }}
            >
              <motion.span className="absolute left-0 top-0 block w-full">
                {digit}
              </motion.span>
            </motion.span>
          ))}
        </motion.div>
      </AnimatePresence>
      <Button onClick={increment} disabled={counter >= 10} className="h-8 w-8">
        +
      </Button>
    </div>
  );
};
