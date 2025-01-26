"use client";
import { AnimatePresence, motion } from "framer-motion";
import { JSX, useState } from "react";
import { Loader2 } from "lucide-react";

import styles from "./Styles.module.css";
import { Slider } from "@/components/ui/slider";

type ButtonState = "idle" | "loading" | "success";

export function AnimatedSignUpButton() {
  const [buttonState, setButtonState] = useState<ButtonState>("idle");
  const [duration, setDuration] = useState<number>(0.3);
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
    if (buttonState !== "idle") {
      return;
    }

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
      <div className="w-full h-[300px] bg-neutral-950 border border-neutral-900 rounded-sm flex items-center py-8 md:py-0 justify-center">
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
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        <label className="min-w-[200px]">
          Duration
          <div className="flex items-center gap-2">
            <Slider
              min={0.1}
              max={2}
              step={0.1}
              defaultValue={[duration]}
              value={[duration]}
              onValueChange={(e) => setDuration(e[0])}
            />
            {duration}s
          </div>
        </label>
        <label className="min-w-[200px]">
          Bounce
          <div className="flex items-center gap-2">
            <Slider
              min={0}
              max={1}
              step={0.1}
              defaultValue={[bounce]}
              value={[bounce]}
              onValueChange={(e) => setBounce(e[0])}
            />
            {bounce}
          </div>
        </label>
      </div>
    </div>
  );
}
