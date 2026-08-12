"use client";

import { useEffect, useState } from "react";

export function useIsMounted(): boolean {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // Setting state in an effect is the point of this hook, not an oversight.
    // The first client render has to match what the server produced, so
    // anything that depends on the resolved theme, or on the DOM, can only
    // appear on the pass after it. ThemeToggle and the article sidebar render a
    // placeholder until this flips.
    //
    // The suppression sits on the call itself. It used to sit above a
    // single-line `useEffect`, and once Prettier broke that across lines it
    // pointed at the wrong statement and was stripped as unused.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMounted(true);
  }, []);

  return isMounted;
}
