import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Chevron } from "../glyphs";
import styles from "../iphone.module.css";

/**
 * UIKit's navigation bar: a large title that scrolls up under a compact bar,
 * which fades in its own title, fill and hairline as it goes (a CSS scroll
 * timeline, see `.navBar` in the stylesheet).
 */
export function NavBar({
  title,
  leading,
  trailing,
}: {
  title: string;
  leading?: ReactNode;
  trailing?: ReactNode;
}) {
  return (
    <>
      <div className={styles.navBar}>
        <div className={styles.navLeading}>{leading}</div>
        <div className={styles.navInlineTitle} aria-hidden>
          {title}
        </div>
        <div className={styles.navTrailing}>{trailing}</div>
      </div>
      <h1 className={styles.largeTitle}>{title}</h1>
    </>
  );
}

/** An inset grouped list, the rounded card most of iOS is built from. */
export function Group({
  header,
  footer,
  children,
  large,
  iconInset,
}: {
  header?: string;
  footer?: ReactNode;
  children: ReactNode;
  large?: boolean;
  /** Rows lead with 29pt icons, so separators start at the text. */
  iconInset?: boolean;
}) {
  return (
    <section>
      {header ? (
        <h2
          className={cn(
            styles.sectionHeader,
            large && styles.sectionHeaderLarge,
          )}
        >
          {header}
        </h2>
      ) : (
        <div className={styles.groupSpacer} />
      )}
      <div className={cn(styles.group, iconInset && styles.groupIconInset)}>
        {children}
      </div>
      {footer ? <p className={styles.groupFooter}>{footer}</p> : null}
    </section>
  );
}

interface RowProps {
  title: ReactNode;
  detail?: ReactNode;
  value?: ReactNode;
  bold?: boolean;
  /** Internal routes navigate in place; anything with a scheme opens in a new
   * tab, the way iOS hands a link to Safari. */
  href?: string;
  chevron?: boolean;
  titleClassName?: string;
  /** A 29pt tile or app icon before the title, as in Settings. */
  icon?: ReactNode;
  /** A row that acts within the app (pushes a page) rather than linking. */
  onPress?: () => void;
}

export function Row({
  title,
  detail,
  value,
  bold,
  href,
  chevron,
  titleClassName,
  icon,
  onPress,
}: RowProps) {
  // A chevron goes somewhere inside the phone; a link that leaves it says
  // so with an arrow, as iOS does for anything that opens elsewhere.
  const leaves = Boolean(href && !href.startsWith("/"));
  const trailing =
    chevron === false ? null : leaves ? (
      <span className={styles.rowValue} aria-hidden>
        ↗
      </span>
    ) : chevron || onPress || href ? (
      <Chevron className={styles.chevron} />
    ) : null;
  const content = (
    <>
      {icon}
      <span className={styles.rowMain}>
        <span
          className={cn(
            styles.rowTitle,
            bold && styles.rowTitleBold,
            titleClassName,
          )}
        >
          {title}
        </span>
        {detail ? <span className={styles.rowDetail}>{detail}</span> : null}
      </span>
      {value === undefined ? null : (
        <span className={styles.rowValue}>{value}</span>
      )}
      {trailing}
    </>
  );

  if (onPress) {
    return (
      <button type="button" className={styles.row} onClick={onPress}>
        {content}
      </button>
    );
  }
  if (!href) {
    return <div className={styles.row}>{content}</div>;
  }
  if (href.startsWith("/")) {
    return (
      <Link href={href} className={styles.row} prefetch={false}>
        {content}
      </Link>
    );
  }
  return (
    <a
      href={href}
      className={styles.row}
      target={href.startsWith("mailto:") ? undefined : "_blank"}
      rel="noopener noreferrer"
    >
      {content}
    </a>
  );
}

/** iOS's switch: green when on, the knob sliding across. */
export function Switch({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      className={styles.switch}
      onClick={() => onChange(!checked)}
    >
      <span className={styles.switchKnob} />
    </button>
  );
}
