import type { ComponentType } from "react";
import { Polaroid } from "@/components/crafts/Polaroid";
import { Ruler } from "@/components/crafts/Ruler";
import { Tonearm } from "@/components/crafts/Tonearm";

/** An interactive craft. The first one is featured on the homepage. */
export interface Craft {
  slug: string;
  title: string;
  year: number;
  /** One or two sentences. What it is, and what it does when you touch it. */
  blurb: string;
  /** Where the idea came from, when it came from somewhere. */
  credit?: string;
  /** Tailwind height for the card, when the default 15rem is too short. */
  height?: string;
  component: ComponentType;
}

export const CRAFTS: Craft[] = [
  {
    slug: "tonearm",
    title: "Tonearm",
    year: 2026,
    blurb:
      "Drag the arm across the record to scrub. The arm is the playhead, the way it is on a real deck, so there is no scrubber to find. It plays my band.",
    credit:
      "Songs from Car Kids, whose full catalogue is at radio.jomaendle.com.",
    height: "min-h-[24rem]",
    component: Tonearm,
  },
  {
    slug: "instant-print",
    title: "Instant Print",
    year: 2026,
    blurb:
      "Drag it back and forth to shake it and the picture comes up, shadows first, the way a real print does. Leave it alone and it develops anyway, slowly.",
    height: "min-h-[22rem]",
    component: Polaroid,
  },
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
