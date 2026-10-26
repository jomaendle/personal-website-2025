import { SOCIAL_LINKS } from "@/lib/config/navigation";
import { SITE } from "@/lib/config/site";
import { BLOG_POSTS } from "@/lib/state/blog";
import { TRACKS } from "@/lib/state/car-kids";
import { PHOTOS } from "@/lib/state/photos";
import { PROJECTS } from "@/lib/state/projects";
import { AppIcon } from "../app-icons";
import type { AppProps } from "../apps";
import { CalendarGlyph, Envelope } from "../glyphs";
import styles from "../iphone.module.css";
import { Group, NavBar, Row } from "./ui";

const initials = SITE.name
  .split(" ")
  .map((part) => part.charAt(0))
  .join("");

const github =
  SOCIAL_LINKS.find((link) => link.label === "GitHub")?.href ??
  "https://github.com/jomaendle";

/** A coloured 29pt tile with a white glyph, Settings' system-row icon. */
const Tile = ({
  color,
  children,
}: {
  color: string;
  children: React.ReactNode;
}) => (
  <span className={styles.tile} style={{ background: color }} aria-hidden>
    {children}
  </span>
);

const appIcon = (art: Parameters<typeof AppIcon>[0]["art"]) => (
  <AppIcon art={art} className={styles.rowAppIcon} />
);

/** The Settings root: my card where the Apple Account sits, then the ways to
 * reach me as system rows, then the apps with what each one holds. */
export default function SettingsApp(_: AppProps) {
  return (
    <div className={styles.scroll}>
      <NavBar title="Settings" />

      <div className={styles.group}>
        <Row
          href="/"
          icon={
            <span className={styles.profileMonogram} aria-hidden>
              {initials}
            </span>
          }
          title={<span className={styles.profileName}>{SITE.name}</span>}
          detail={SITE.role}
        />
      </div>

      <Group iconInset>
        <Row
          href={`mailto:${SITE.contact.email}`}
          icon={
            <Tile color="#0a84ff">
              <Envelope width={18} height={18} />
            </Tile>
          }
          title="Email"
          value={SITE.contact.email}
          chevron
        />
        <Row
          href={SITE.contact.booking}
          icon={
            <Tile color="#ff3b30">
              <CalendarGlyph width={18} height={18} />
            </Tile>
          }
          title="Book a Call"
        />
        <Row
          href={SITE.social.linkedin}
          icon={appIcon("linkedin")}
          title="LinkedIn"
        />
        <Row href={github} icon={appIcon("github")} title="GitHub" />
      </Group>

      <Group iconInset>
        <Row
          href="/blog"
          icon={appIcon("notes")}
          title="Notes"
          value={`${BLOG_POSTS.length} articles`}
        />
        <Row
          icon={appIcon("photos")}
          title="Photos"
          value={`${PHOTOS.length} photos`}
        />
        <Row
          icon={appIcon("music")}
          title="Music"
          value={`${TRACKS.length} songs`}
        />
        <Row
          icon={appIcon("safari")}
          title="Safari"
          value={`${PROJECTS.length} projects`}
        />
      </Group>

      <Group footer="The same site, without the phone.">
        <Row
          title="Open jomaendle.com"
          href="/"
          // An action row, in the tint, has no disclosure chevron on iOS.
          chevron={false}
          titleClassName={styles.rowLink}
        />
      </Group>
    </div>
  );
}
