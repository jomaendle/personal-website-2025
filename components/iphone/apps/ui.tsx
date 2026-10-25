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
}

export function Row({
  title,
  detail,
  value,
  bold,
  href,
  chevron = Boolean(href),
  titleClassName,
  icon,
}: RowProps) {
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
      {chevron ? <Chevron className={styles.chevron} /> : null}
    </>
  );

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
