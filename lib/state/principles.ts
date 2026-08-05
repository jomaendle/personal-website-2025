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
    title: "Details are the work",
    body: "How something is built shows up in how it feels to use. That is most of the job.",
  },
  {
    num: "02",
    title: "AI as a teammate",
    body: "The model is the easy part. What makes it useful is the setup around it: good context, clear boundaries, fast feedback.",
  },
  {
    num: "03",
    title: "Build in the open",
    body: "Side projects and writing are how I find out what I actually understand. So I publish them.",
  },
];
