import { SITE } from "@/lib/config/site";
import { BLOG_POSTS } from "@/lib/state/blog";
import { IPHONE_COPY } from "@/lib/state/iphone-copy";
import { PHOTOS } from "@/lib/state/photos";
import { PROJECTS } from "@/lib/state/projects";
import type { AppProps } from "../apps";
import styles from "../iphone.module.css";
import { Group, NavBar, Row } from "./ui";

/** Settings › General › About, with the site's numbers in place of the
 * phone's, and the way back to the regular site. */
export default function SettingsApp(_: AppProps) {
  return (
    <div className={styles.scroll}>
      <NavBar title="About" />
      <Group>
        <Row title="Name" value={IPHONE_COPY.deviceName} />
        <Row title="Owner" value={SITE.name} />
        <Row title="Role" value={SITE.shortRole} />
      </Group>
      <Group>
        <Row title="Articles" value={BLOG_POSTS.length} />
        <Row title="Photos" value={PHOTOS.length} />
        <Row title="Projects" value={PROJECTS.length} />
      </Group>
      <Group footer="The same site, without the phone.">
        <Row
          title="Open jomaendle.com"
          href="/"
          titleClassName={styles.rowLink}
        />
      </Group>
    </div>
  );
}
