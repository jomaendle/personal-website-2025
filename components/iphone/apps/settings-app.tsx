import { m } from "framer-motion";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { SITE, SITE_INITIALS } from "@/lib/config/site";
import { BLOG_POSTS } from "@/lib/state/blog";
import { TRACKS } from "@/lib/state/car-kids";
import { PHOTOS, WALLPAPERS } from "@/lib/state/photos";
import { PROJECTS } from "@/lib/state/projects";
import { cn } from "@/lib/utils";
import { AppIcon } from "../app-icons";
import { type AppProps, WEB_CLIPS } from "../apps";
import { springTo } from "../compositor-spring";
import { BackChevron, CalendarGlyph, Envelope } from "../glyphs";
import styles from "../iphone.module.css";
import { FADE, SPRING_PUSH } from "../motion";
import { formatClock, useMinute } from "../use-clock";
import { usePushStack } from "../use-push-stack";
import { useSwipeBack } from "../use-swipe-back";
import { setWallpaper, useWallpaper } from "../wallpapers";
import { Group, NavBar, Row, Switch } from "./ui";

const github = WEB_CLIPS.find((clip) => clip.name === "GitHub")?.href ?? "/";

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
 * reach me as system rows, the apps with what each one holds, and the
 * phone's own settings: the wallpaper, and the way back to the plain site.
 * Wallpaper pushes its own page, as Settings does. */
export default function SettingsApp(_: AppProps) {
  const [page, setPage] = useState<"wallpaper" | null>(null);
  const stack = usePushStack(0);
  const { nav, reduced } = stack;
  const popping = useRef(false);
  const opener = useRef<HTMLElement | null>(null);

  const push = () => {
    opener.current = document.activeElement as HTMLElement | null;
    popping.current = false;
    setPage("wallpaper");
    // On the next frame, once the page has mounted to be slid in.
    requestAnimationFrame(() => {
      if (!popping.current) {
        springTo(nav, { to: 1, transition: reduced ? FADE : SPRING_PUSH });
      }
    });
  };

  const pop = (velocity = 0) => {
    if (popping.current) {
      return;
    }
    popping.current = true;
    springTo(nav, {
      to: 0,
      transition: reduced ? FADE : SPRING_PUSH,
      velocity,
    }).then((completed) => {
      if (popping.current && !completed) {
        // Caught by a finger on its way out: the finger decides again.
        popping.current = false;
        return;
      }
      if (completed) {
        setPage(null);
        popping.current = false;
        const el = opener.current;
        requestAnimationFrame(() => {
          if (el?.isConnected) {
            el.focus({ preventScroll: true });
          }
        });
      }
    });
  };

  useEffect(() => {
    if (!page) {
      return;
    }
    const onKey = (event: KeyboardEvent) => {
      // Escape pops the page; while it is already on its way out, the key
      // goes on to the window and closes the app.
      if (event.key === "Escape" && !popping.current) {
        event.stopPropagation();
        pop();
      }
    };
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  });

  return (
    <>
      <m.div
        ref={stack.backRef}
        className={styles.navLayer}
        style={{ x: stack.backX }}
        inert={page !== null}
      >
        <SettingsRoot onWallpaper={push} />
        <m.div
          ref={stack.dimRef}
          className={styles.navDim}
          style={{ opacity: stack.dim }}
          aria-hidden
        />
      </m.div>

      {page ? (
        <m.div
          ref={stack.frontRef}
          className={cn(styles.navLayer, styles.navTop)}
          style={{ x: stack.frontX, opacity: stack.frontOpacity }}
        >
          <WallpaperPage nav={nav} onBack={pop} />
        </m.div>
      ) : null}
    </>
  );
}

function SettingsRoot({ onWallpaper }: { onWallpaper: () => void }) {
  const router = useRouter();
  const wallpaper = useWallpaper();
  /** The "iPhone" switch: off means the plain site, which it then opens. */
  const [phone, setPhone] = useState(true);

  const leave = () => {
    setPhone(false);
    // Let the switch be seen going off before the page changes.
    setTimeout(() => router.push("/"), 220);
  };

  return (
    <div className={styles.scroll}>
      <NavBar title="Settings" />

      <div className={styles.group}>
        <Row
          href="/"
          icon={
            <span className={styles.profileMonogram} aria-hidden>
              {SITE_INITIALS}
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

      <Group iconInset>
        <Row
          icon={
            <Tile color="#32ade6">
              <WallpaperGlyph />
            </Tile>
          }
          title="Wallpaper"
          value={wallpaper.title}
          onPress={onWallpaper}
        />
      </Group>

      <Group footer="Off shows the same site without the phone.">
        <Row
          title="iPhone Version"
          value={
            <Switch
              checked={phone}
              onChange={leave}
              label="Show the site as an iPhone"
            />
          }
        />
      </Group>
    </div>
  );
}

/** A photo in a frame, Settings' Wallpaper icon. */
const WallpaperGlyph = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden>
    <title>Wallpaper</title>
    <rect
      x="2"
      y="2.5"
      width="14"
      height="13"
      rx="2.5"
      fill="none"
      stroke="#fff"
      strokeWidth="1.6"
    />
    <circle cx="6.3" cy="6.8" r="1.4" fill="#fff" />
    <path d="M3.5 13.5 7.5 9.5l2.5 2.5 2-2 2.5 3.5Z" fill="#fff" />
  </svg>
);

/** The wallpaper page: each choice as a small lock screen, the current one
 * ringed. Choosing applies at once, behind this app. */
function WallpaperPage({
  nav,
  onBack,
}: {
  nav: ReturnType<typeof usePushStack>["nav"];
  onBack: (velocity?: number) => void;
}) {
  const current = useWallpaper();
  const clock = formatClock(useMinute());
  const swipeBack = useSwipeBack(nav, onBack);
  const pageRef = useRef<HTMLDivElement>(null);

  // Focus follows the push, a frame after the page mounts (see note-view).
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      pageRef.current?.focus({ preventScroll: true });
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <div
      ref={pageRef}
      className={styles.scroll}
      tabIndex={-1}
      {...swipeBack}
    >
      <NavBar
        title="Wallpaper"
        leading={
          <button
            type="button"
            className={styles.navBack}
            onClick={() => onBack()}
          >
            <BackChevron width={10} height={17} />
            Settings
          </button>
        }
      />
      <p className={styles.wallpaperLead}>
        From the photos in the Photos app. The lock screen and the home screen
        share it.
      </p>
      <ul className={styles.wallpaperGrid}>
        {WALLPAPERS.map((choice) => {
          const chosen = choice.key === current.key;
          return (
            <li key={choice.key}>
              <button
                type="button"
                className={cn(
                  styles.wallpaperOption,
                  chosen && styles.wallpaperChosen,
                )}
                aria-pressed={chosen}
                onClick={() => setWallpaper(choice.key)}
              >
                <span className={styles.wallpaperFrame}>
                  <Image
                    src={choice.image}
                    alt=""
                    fill
                    sizes="120px"
                    className={styles.wallpaper}
                  />
                  <span className={styles.wallpaperClock} aria-hidden>
                    {clock}
                  </span>
                </span>
                <span className={styles.wallpaperTitle}>{choice.title}</span>
                <span className={styles.wallpaperPlace}>{choice.place}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
