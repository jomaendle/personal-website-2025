import type { ComponentType } from "react";
import { Ruler } from "@/components/crafts/Ruler";

/** An interactive craft. The first one is featured on the homepage. */
export interface Craft {
  slug: string;
  title: string;
  year: number;
  /** One or two sentences. What it is, and what it does when you touch it. */
  blurb: string;
  /** Where the idea came from, when it came from somewhere. */
  credit?: string;
  component: ComponentType;
}

export const CRAFTS: Craft[] = [
  {
    slug: "ruler",
    title: "Ruler",
    year: 2026,
    blurb:
      "Ticks lean toward the pointer. The needle rides a spring, so it overshoots and settles instead of sliding. Leave it alone and it drifts.",
    credit: "After Rauno Freiberg's minimaps.",
    component: Ruler,
  },
];
