/**
 * Navigation config — single source of truth for links.
 *
 * Consumed by the NameHeading masthead nav, the shared page top bar, and the
 * Footer. Editing a label or href here updates every consumer.
 */

export interface NavLink {
  label: string;
  href: string;
  /**
   * Language of the target page, when it differs from the page linking to it.
   * Set on the legal links: the site is `<html lang="en">` but those two routes
   * are German, so the anchor has to say so.
   */
  hrefLang?: string;
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

/**
 * Legal links surfaced in the footer.
 *
 * Labelled in English, because the footer they sit in is English and two German
 * words in it read as an oversight. The pages themselves stay German: they are
 * a § 5 DDG imprint and a GDPR privacy notice for a German sole trader, and the
 * German wording is the one that governs. `hrefLang` carries that switch to
 * browsers and screen readers.
 *
 * "Legal Notice" rather than "Imprint": German law wants the page to be plainly
 * recognisable, and "Imprint" is a literal rendering of Impressum that means
 * something else in English.
 */
export const LEGAL_LINKS: NavLink[] = [
  { label: "Legal Notice", href: "/impressum", hrefLang: "de" },
  { label: "Privacy", href: "/datenschutz", hrefLang: "de" },
];
