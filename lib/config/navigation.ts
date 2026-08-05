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

/**
 * Primary navigation surfaced in the masthead.
 *
 * `/business` is deliberately absent. It is an unlisted page: reachable by its
 * URL, from a CV or a message, but never by browsing the site. Adding it back
 * here would resurface it in the masthead, the page top bar and the footer at
 * once, since all three read this array. The page still carries its own
 * metadata, JSON-LD and sitemap entry, so search and AI crawlers can find it.
 */
export const PRIMARY_NAV: NavLink[] = [
  { label: "Writing", href: "/blog" },
  { label: "About", href: "/about" },
];

/** Legal links surfaced in the footer (German imprint + privacy). */
export const LEGAL_LINKS: NavLink[] = [
  { label: "Impressum", href: "/impressum" },
  { label: "Datenschutz", href: "/datenschutz" },
];
