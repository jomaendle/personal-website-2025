"use client";
import { AnimatePresence, m } from "framer-motion";
import { Loader2 } from "lucide-react";
import { type JSX, useState } from "react";
import { ComponentPreview } from "@/components/component-preview";
import { Slider } from "@/components/ui/slider";
import styles from "./Styles.module.css";

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
      <ComponentPreview>
        <div className="animated-sign-up-button">
          <button
            type="button"
            className={styles.button}
            onClick={handleSubmit}
          >
            <AnimatePresence mode="popLayout" initial={false}>
              <m.span
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
              </m.span>
            </AnimatePresence>
          </button>
        </div>
      </ComponentPreview>

      <div className="flex flex-col gap-8 md:flex-row">
        <div className="min-w-[200px]">
          Duration
          <div className="flex items-center gap-2">
            <Slider
              aria-label="Duration"
              min={0.1}
              max={2}
              step={0.1}
              defaultValue={[duration]}
              value={[duration]}
              onValueChange={(e) => setDuration(e[0] ?? 0.3)}
            />
            {duration}s
          </div>
        </div>
        <div className="min-w-[200px]">
          Bounce
          <div className="flex items-center gap-2">
            <Slider
              aria-label="Bounce"
              min={0}
              max={1}
              step={0.1}
              defaultValue={[bounce]}
              value={[bounce]}
              onValueChange={(e) => setBounce(e[0] ?? 0)}
            />
            {bounce}
          </div>
        </div>
      </div>
    </div>
  );
}
