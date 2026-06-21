/**
 * "How I work" principles — surfaced on the /about route.
 *
 * Extracted out of the About page so the copy lives alongside the other
 * content modules rather than inline in the route component.
 */

export interface Principle {
  num: string;
  title: string;
  body: string;
}

export const PRINCIPLES: Principle[] = [
  {
    num: "01",
    title: "Craft is the signal",
    body: "How a thing is built is visible in how it feels to use. The details are not decoration — they are the argument.",
  },
  {
    num: "02",
    title: "AI as a teammate",
    body: "The leverage is not in the model, it is in the system around it: context, boundaries, and fast feedback.",
  },
  {
    num: "03",
    title: "Build in the open",
    body: "Side projects, writing, and talks keep the thinking honest. Shipping is how I learn what is actually true.",
  },
];
