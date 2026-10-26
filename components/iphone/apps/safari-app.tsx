import Link from "next/link";
import { PROJECTS } from "@/lib/state/projects";
import { cn } from "@/lib/utils";
import type { AppProps } from "../apps";
import { BackChevron, Ellipsis, Reload } from "../glyphs";
import styles from "../iphone.module.css";

/** Tile colours for Favorites, picked per project rather than by hash so
 * they never collide. */
const TILE_COLORS = ["#0a84ff", "#30d158", "#ff9f0a", "#bf5af2", "#ff375f"];

const WWW = /^www\./;
const host = (url: string) => new URL(url).host.replace(WWW, "");

/** Safari's start page: my projects as Favorites, then as cards with what
 * each one is. The address bar leads back to the regular site. */
export default function SafariApp(_: AppProps) {
  return (
    <div className={styles.safari}>
      <div className={cn(styles.scroll, styles.scrollWithBar)}>
        <div style={{ height: "var(--top-inset)" }} />
        <h1 className={cn(styles.sectionHeader, styles.sectionHeaderLarge)}>
          Favorites
        </h1>
        <ul className={styles.favorites}>
          {PROJECTS.map((project, index) => (
            <li key={project.id}>
              <a
                href={project.link}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.favorite}
              >
                <span
                  className={styles.favoriteTile}
                  style={{ color: TILE_COLORS[index % TILE_COLORS.length] }}
                  aria-hidden
                >
                  {project.title.charAt(0).toUpperCase()}
                </span>
                <span className={styles.favoriteLabel}>{project.title}</span>
              </a>
            </li>
          ))}
        </ul>

        <h2 className={cn(styles.sectionHeader, styles.sectionHeaderLarge)}>
          Selected Work
        </h2>
        {PROJECTS.map((project) => (
          <a
            key={project.id}
            href={project.link}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.card}
          >
            <span className={cn(styles.cardHost, "block")}>
              {host(project.link)}
            </span>
            <span className={cn(styles.cardTitle, "block")}>
              {project.title}
            </span>
            <span className={cn(styles.cardBody, "block")}>
              {project.description}
            </span>
          </a>
        ))}
      </div>

      {/* iOS 26's compact tab bar: one floating glass pill for the address,
          between back and the page menu. */}
      <div className={styles.floatingBar}>
        <span
          className={cn(styles.glassButton, styles.glassButtonLarge)}
          aria-hidden
        >
          <BackChevron width={11} height={18} />
        </span>
        <Link href="/" className={cn(styles.glassField, styles.addressPill)}>
          <span className={styles.addressAa} aria-hidden>
            <small>a</small>A
          </span>
          <span>jomaendle.com</span>
          <Reload className={styles.addressReload} />
        </Link>
        <span
          className={cn(styles.glassButton, styles.glassButtonLarge)}
          aria-hidden
        >
          <Ellipsis />
        </span>
      </div>
    </div>
  );
}
