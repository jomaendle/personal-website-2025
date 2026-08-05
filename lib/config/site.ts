/**
 * Site identity — single source of truth.
 *
 * Name, role, avatar, availability and social links live here so presentation
 * components never hardcode personal data. Mirrors the `lib/state` data pattern.
 */

interface SocialLinks {
  linkedin: string;
}

interface ContactChannels {
  /** Business inbox — where inquiry-form leads and direct mail land. */
  email: string;
  /** Public Google Calendar booking page for intro calls. */
  booking: string;
}

export interface SiteConfig {
  /** Display name / wordmark used across the masthead, footer and article meta. */
  name: string;
  /** Full role, including the focus qualifier — used as the homepage eyebrow. */
  role: string;
  /** Condensed role — used in the article author row where space is tight. */
  shortRole: string;
  /** Avatar served from `public/`. */
  avatar: string;
  social: SocialLinks;
  contact: ContactChannels;
}

export const SITE: SiteConfig = {
  name: "Jo Mändle",
  role: "Principal Solution Architect – AI in SDLC",
  shortRole: "Principal Solution Architect",
  avatar: "/avatar.jpeg",
  social: {
    linkedin: "https://www.linkedin.com/in/johannes-maendle/",
  },
  contact: {
    email: "business@jomaendle.com",
    booking: "https://calendar.app.google/jpSRhy2ekZWZEv3W7",
  },
};
