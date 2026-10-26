import { SOCIAL_LINKS } from "@/lib/config/navigation";
import { SITE, SITE_INITIALS } from "@/lib/config/site";
import { JOB_POSITIONS } from "@/lib/state/jobs";
import type { AppProps } from "../apps";
import { CalendarGlyph, Envelope, Globe } from "../glyphs";
import styles from "../iphone.module.css";
import { Group, Row } from "./ui";

const SCHEME = /^https?:\/\/(www\.)?/;
const TRAILING_SLASH = /\/$/;
const display = (url: string) =>
  url.replace(SCHEME, "").replace(TRAILING_SLASH, "");

/** My contact card, with every way to reach me and where I've worked. */
export default function ContactsApp(_: AppProps) {
  return (
    <div className={styles.scroll}>
      <header className={styles.contactHead}>
        <span className={styles.monogram} aria-hidden>
          {SITE_INITIALS}
        </span>
        <h1 className={styles.contactName}>{SITE.name}</h1>
        <p className={styles.contactRole}>{SITE.role}</p>
        <div className={styles.actions}>
          <a className={styles.action} href={`mailto:${SITE.contact.email}`}>
            <Envelope />
            mail
          </a>
          <a
            className={styles.action}
            href={SITE.contact.booking}
            target="_blank"
            rel="noopener noreferrer"
          >
            <CalendarGlyph />
            book a call
          </a>
          <a
            className={styles.action}
            href={SITE.social.linkedin}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Globe />
            LinkedIn
          </a>
        </div>
      </header>

      <Group>
        <Row
          title={<span className={styles.rowLabel}>email</span>}
          detail={<span className={styles.rowLink}>{SITE.contact.email}</span>}
          href={`mailto:${SITE.contact.email}`}
          chevron={false}
        />
        <Row
          title={<span className={styles.rowLabel}>homepage</span>}
          detail={<span className={styles.rowLink}>jomaendle.com</span>}
          href="/"
          chevron={false}
        />
        {SOCIAL_LINKS.map((link) => (
          <Row
            key={link.href}
            title={<span className={styles.rowLabel}>{link.label}</span>}
            detail={
              <span className={styles.rowLink}>{display(link.href)}</span>
            }
            href={link.href}
            chevron={false}
          />
        ))}
      </Group>

      <Group header="Experience">
        {JOB_POSITIONS.map((job) => (
          <Row
            key={`${job.company}-${job.role}`}
            title={job.company}
            // Role and dates on their own lines: dates are never cut off.
            detail={
              <span className={styles.rowDetailWrap}>
                {job.role}
                <br />
                {job.startDate} – {job.endDate}
              </span>
            }
          />
        ))}
      </Group>
    </div>
  );
}
