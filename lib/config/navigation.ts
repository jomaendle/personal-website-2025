/**
 * Navigation config — single source of truth for links.
 *
 * Consumed by the NameHeading masthead nav, the shared page top bar, and the
 * Footer. Editing a label or href here updates every consumer.
 */

export interface NavLink {
  label: string;
  href: string;
}

/** Primary navigation surfaced in the masthead. */
export const PRIMARY_NAV: NavLink[] = [
  { label: "Writing", href: "/blog" },
  { label: "About", href: "/about" },
  { label: "Work with me", href: "/business" },
];

/** Legal links surfaced in the footer (German imprint + privacy). */
export const LEGAL_LINKS: NavLink[] = [
  { label: "Impressum", href: "/impressum" },
  { label: "Datenschutz", href: "/datenschutz" },
];
