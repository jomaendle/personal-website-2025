import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { CraftsContainer } from "@/components/crafts/CraftsContainer";

// The container variants for the whole number
const containerVariants = {
  initial: { opacity: 0.3 },
  animate: { opacity: 1 },
  exit: { opacity: 0.3 },
};

export const CounterCraft = () => {
  const [counter, setCounter] = useState(0);
  const [direction, setDirection] = useState<"increment" | "decrement">(
    "increment",
  );

  const increment = () => {
    if (counter >= 10) return;
    setDirection("increment");
    setCounter((c) => c + 1);
  };

  const decrement = () => {
    if (counter <= 0) return;
    setDirection("decrement");
    setCounter((c) => c - 1);
  };

  // Create variants as a function of the direction
  const digitVariants = {
    initial: (direction: "increment" | "decrement") => ({
      y: direction === "increment" ? "-100%" : "100%",
      opacity: 0,
    }),
    animate: {
      y: "0%",
      opacity: 1,
    },
    exit: (direction: "increment" | "decrement") => ({
      y: direction === "increment" ? "100%" : "-100%",
      opacity: 0,
    }),
  };

  const digits = String(counter).split("");

  return (
    <CraftsContainer
      className="flex font-mono"
      title="Animated Counter"
      innerClassName="gap-6"
    >
      <Button onClick={decrement} disabled={counter === 0} className="h-8 w-8">
        -
      </Button>
      <AnimatePresence mode="popLayout" initial={false} custom={direction}>
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
              key={`${counter}-${i}`}
              custom={direction}
              variants={digitVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.45, type: "spring", bounce: 0.4 }}
              className="relative inline-flex h-12 w-5 items-center justify-center overflow-hidden"
              style={{ textAlign: "center" }}
            >
              <motion.span className="absolute inset-0 flex h-full w-full items-center text-4xl">
                {digit}
              </motion.span>
            </motion.span>
          ))}
        </motion.div>
      </AnimatePresence>
      <Button onClick={increment} disabled={counter >= 10} className="h-8 w-8">
        +
      </Button>
    </CraftsContainer>
  );
};
