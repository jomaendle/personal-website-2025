"use client";
import { AnimatePresence, motion } from "framer-motion";
import { JSX, useState } from "react";
import { Loader2 } from "lucide-react";

import styles from "./Styles.module.css";

type ButtonState = "idle" | "loading" | "success";

export function AnimatedSignUpButton() {
  const [buttonState, setButtonState] = useState<ButtonState>("idle");
  const [duration, setDuration] = useState(0.3);
  const [bounce, setBounce] = useState(0);

  const buttonStates: {
    [key in ButtonState]: string | JSX.Element;
  } = {
    idle: "Sign up for newsletter",
    loading: (
      <div className="size-4 animate-spin">
        <Loader2 className={styles.icon} />
      </div>
    ),
    success: "Thank you!",
  };

  const handleSubmit = () => {
    setButtonState("loading");

    setTimeout(() => {
      setButtonState("success");
    }, 2000);

    setTimeout(() => {
      setButtonState("idle");
    }, 4000);
  };

  return (
    <div className={styles.animatedSignUpButton}>
      <div className="animated-sign-up-button">
        <button className={styles.button} onClick={handleSubmit}>
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span
              className={styles.span}
              key={buttonState}
              transition={{
                type: "spring",
                duration,
                bounce,
              }}
              initial={{
                opacity: 0,
                y: -25,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              exit={{
                opacity: 0,
                y: 25,
              }}
            >
              {buttonStates[buttonState]}
            </motion.span>
          </AnimatePresence>
        </button>
      </div>

      <div className={styles.sliderContainer}>
        <label>
          Duration: {duration}s
          <input
            type="range"
            min="0.1"
            max="2"
            step="0.1"
            value={duration}
            onChange={(e) => setDuration(parseFloat(e.target.value))}
          />
        </label>
        <label>
          Bounce: {bounce}
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={bounce}
            onChange={(e) => setBounce(parseFloat(e.target.value))}
          />
        </label>
      </div>
    </div>
  );
}
