"use client";

import type { MotionValue } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import {
  type ReactNode,
  startTransition,
  useEffect,
  useRef,
  useState,
} from "react";
import type { NoteBlock, NoteDocument, NoteInline } from "@/lib/iphone-notes";
import { cn } from "@/lib/utils";
import { useViewCount } from "@/lib/views";
import { BackChevron, Share } from "../glyphs";
import styles from "../iphone.module.css";
import { useShare } from "../use-share";
import { useSwipeBack } from "../use-swipe-back";

// ---- Fetching ---------------------------------------------------------------

const cache = new Map<string, Promise<NoteDocument | null>>();
/** Notes whose body has arrived: they open with it already there. */
const loaded = new Set<string>();

/** Each note is a small static JSON file built from the article's MDX. One
 * request per note per visit, started as early as a finger lands on a row. */
export function prefetchNote(slug: string): Promise<NoteDocument | null> {
  let pending = cache.get(slug);
  if (!pending) {
    pending = fetch(`/iphone/notes/${slug}`)
      .then((res) => {
        if (res.ok) {
          return res.json() as Promise<NoteDocument>;
        }
        // A note that isn't there stays not there; a server having a bad
        // moment gets asked again on the next open.
        if (res.status !== 404) {
          cache.delete(slug);
        }
        return null;
      })
      .then((note) => {
        if (note) {
          loaded.add(slug);
        }
        return note;
      })
      .catch(() => {
        // Let the next open try again rather than cache the failure.
        cache.delete(slug);
        return null;
      });
    cache.set(slug, pending);
  }
  return pending;
}

function useNote(slug: string) {
  const [state, setState] = useState<{
    note: NoteDocument | null;
    failed: boolean;
  }>({ note: null, failed: false });
  useEffect(() => {
    let live = true;
    prefetchNote(slug).then((note) => {
      if (live) {
        // A transition, so rendering a long note yields to the frames of
        // the push it usually lands in the middle of.
        startTransition(() => setState({ note, failed: note === null }));
      }
    });
    return () => {
      live = false;
    };
  }, [slug]);
  return state;
}

let count: Intl.NumberFormat | undefined;
const formatViews = (views: number) => {
  count ??= new Intl.NumberFormat();
  return `${count.format(views)} ${views === 1 ? "View" : "Views"}`;
};

let longDate: Intl.DateTimeFormat | undefined;
/** The date line at the top of a note: "22 November 2025". */
const noteDate = (date: string) => {
  longDate ??= new Intl.DateTimeFormat(undefined, { dateStyle: "long" });
  const parsed = new Date(date);
  return Number.isNaN(parsed.getTime()) ? date : longDate.format(parsed);
};

// ---- The note ---------------------------------------------------------------

interface NoteViewProps {
  slug: string;
  title: string;
  date: string;
  /** The navigation stack's position, driven here by the back swipe. */
  nav: MotionValue<number>;
  onBack: (velocity?: number) => void;
  onOpenNote: (slug: string) => void;
}

/**
 * One article as a note: the date line, the title in Notes' Title style,
 * then the body in Notes' Heading, Subheading, Body and Monostyled styles,
 * with images and videos as attachments and live demos as link cards.
 *
 * The title and date are known before the body arrives, so the note opens
 * with them at once and the body follows a beat later.
 */
export function NoteView({
  slug,
  title,
  date,
  nav,
  onBack,
  onOpenNote,
}: NoteViewProps) {
  const { note, failed } = useNote(slug);
  // Whether the body was already loaded when the note opened, fixed then.
  const [arrivedLoaded] = useState(() => loaded.has(slug));
  const titleRef = useRef<HTMLHeadingElement>(null);
  const { share: shareLink, hud } = useShare();
  const swipeBack = useSwipeBack(nav, onBack);
  // Reading the note counts as reading the article, as on the blog.
  const { views } = useViewCount(slug, true);

  // Focus moves to the title once the first frame is up. Focusing in the
  // commit itself forces the new view's layout before the push can start.
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      titleRef.current?.focus({ preventScroll: true });
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  const share = () =>
    shareLink(`${window.location.origin}/blog/${slug}`, title);

  return (
    <div className={styles.noteView}>
      <div className={cn(styles.scroll, styles.noteScroll)} {...swipeBack}>
        <article className={styles.noteBody}>
          <p className={styles.noteDate}>
            {noteDate(date)}
            {/* Its own line, held open while the count loads, so the
                title never moves. */}
            <span className={styles.noteViews} data-ready={views !== null}>
              {views === null ? "\u00a0" : formatViews(views)}
            </span>
          </p>
          <h1 ref={titleRef} className={styles.noteTitle} tabIndex={-1}>
            {title}
          </h1>
          {note ? (
            // A body that arrives after the note opened fades up into place;
            // one already loaded is simply there.
            <div className={cn(!arrivedLoaded && styles.noteArrive)}>
              <Blocks
                blocks={note.blocks}
                slug={slug}
                onOpenNote={onOpenNote}
              />
            </div>
          ) : null}
          {failed ? (
            <p className={styles.noteFailed}>
              This note didn’t load.{" "}
              <Link href={`/blog/${slug}`}>Read it on jomaendle.com</Link>
            </p>
          ) : null}
        </article>
      </div>

      <div className={styles.noteBar}>
        <button
          type="button"
          className={styles.glassButton}
          onClick={() => onBack()}
          aria-label="Back to Writing"
        >
          <BackChevron width={10} height={17} />
        </button>
        <button
          type="button"
          className={cn(styles.glassButton, styles.tinted)}
          onClick={share}
          aria-label="Share"
        >
          <Share />
        </button>
      </div>

      {hud}
    </div>
  );
}

// ---- Blocks -----------------------------------------------------------------

const ATTACHMENT_SIZES =
  "(min-width: 640px) and (min-height: 640px) 370px, 92vw";

function Blocks({
  blocks,
  slug,
  onOpenNote,
}: {
  blocks: NoteBlock[];
  slug: string;
  onOpenNote: (slug: string) => void;
}) {
  return blocks.map((block, index) => (
    // Notes are static documents: a block's position is its identity.
    // biome-ignore lint/suspicious/noArrayIndexKey: blocks never reorder
    <Block key={index} block={block} slug={slug} onOpenNote={onOpenNote} />
  ));
}

function Block({
  block,
  slug,
  onOpenNote,
}: {
  block: NoteBlock;
  slug: string;
  onOpenNote: (slug: string) => void;
}): ReactNode {
  const text = (nodes: NoteInline[]) => (
    <Inlines nodes={nodes} onOpenNote={onOpenNote} />
  );
  switch (block.t) {
    case "heading":
      return block.level === 2 ? (
        <h2 className={styles.noteHeading}>{text(block.c)}</h2>
      ) : (
        <h3 className={styles.noteSubheading}>{text(block.c)}</h3>
      );
    case "p":
      return <p className={styles.noteP}>{text(block.c)}</p>;
    case "list": {
      const items = block.items.map((item, index) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: list items never reorder
        <li key={index}>
          <Blocks blocks={item} slug={slug} onOpenNote={onOpenNote} />
        </li>
      ));
      return block.ordered ? (
        <ol className={styles.noteList} start={block.start}>
          {items}
        </ol>
      ) : (
        <ul className={styles.noteList}>{items}</ul>
      );
    }
    case "quote":
      return (
        <blockquote className={styles.noteQuote}>
          <Blocks blocks={block.c} slug={slug} onOpenNote={onOpenNote} />
        </blockquote>
      );
    case "code":
      return (
        <pre className={styles.noteMono}>
          <code>{block.v}</code>
        </pre>
      );
    case "image":
      return (
        <figure className={styles.noteAttachment}>
          <Image
            src={block.src}
            width={block.w}
            height={block.h}
            sizes={ATTACHMENT_SIZES}
            alt={block.caption}
          />
          {block.caption ? <figcaption>{block.caption}</figcaption> : null}
        </figure>
      );
    case "video":
      return (
        <figure className={styles.noteAttachment}>
          <video
            src={block.src}
            // Its size from the file, read at build, holds the space open
            // before the first frame arrives.
            width={block.w}
            height={block.h}
            style={
              block.w && block.h
                ? { aspectRatio: `${block.w} / ${block.h}` }
                : undefined
            }
            controls
            playsInline
            muted
            preload="metadata"
          />
          {block.caption ? <figcaption>{block.caption}</figcaption> : null}
        </figure>
      );
    case "baseline":
      return (
        <LinkCard
          href={`https://webstatus.dev/features/${block.feature}`}
          title={`Baseline: ${prettyFeature(block.feature)}`}
          detail="webstatus.dev"
          tile="baseline"
        />
      );
    case "demo":
      return (
        <LinkCard
          href={`/blog/${slug}`}
          title={block.label}
          detail="Try it live on jomaendle.com"
          tile="site"
        />
      );
    case "hr":
      return <hr className={styles.noteRule} />;
    default:
      return null;
  }
}

const prettyFeature = (id: string) =>
  id.charAt(0).toUpperCase() + id.slice(1).replaceAll("-", " ");

/** A rich link, the card Notes makes of a pasted URL. */
function LinkCard({
  href,
  title,
  detail,
  tile,
}: {
  href: string;
  title: string;
  detail: string;
  tile: "site" | "baseline";
}) {
  const content = (
    <>
      <span
        className={cn(
          styles.linkCardTile,
          tile === "baseline" && styles.linkCardTileBaseline,
        )}
        aria-hidden
      >
        {tile === "baseline" ? "✓" : "J"}
      </span>
      <span className={styles.rowMain}>
        <span className={styles.linkCardTitle}>{title}</span>
        <span className={styles.linkCardDetail}>{detail}</span>
      </span>
    </>
  );
  return href.startsWith("/") ? (
    <Link href={href} className={styles.linkCard} prefetch={false}>
      {content}
    </Link>
  ) : (
    <a
      href={href}
      className={styles.linkCard}
      target="_blank"
      rel="noopener noreferrer"
    >
      {content}
    </a>
  );
}

function Inlines({
  nodes,
  onOpenNote,
}: {
  nodes: NoteInline[];
  onOpenNote: (slug: string) => void;
}): ReactNode {
  return nodes.map((node, index) => {
    const key = index;
    const children = (c: NoteInline[]) => (
      <Inlines nodes={c} onOpenNote={onOpenNote} />
    );
    switch (node.t) {
      case "text":
        return node.v;
      case "strong":
        return <strong key={key}>{children(node.c)}</strong>;
      case "em":
        return <em key={key}>{children(node.c)}</em>;
      case "del":
        return <s key={key}>{children(node.c)}</s>;
      case "code":
        return (
          <code key={key} className={styles.noteInlineCode}>
            {node.v}
          </code>
        );
      case "br":
        return <br key={key} />;
      case "link":
        return (
          <NoteLink key={key} href={node.href} onOpenNote={onOpenNote}>
            {children(node.c)}
          </NoteLink>
        );
      default:
        return null;
    }
  });
}

const NOTE_LINK = /^\/blog\/([\w-]+)\/?$/;

/** Another article opens as a note, in place; anything else leaves, the
 * way a link in Notes opens Safari. */
function NoteLink({
  href,
  onOpenNote,
  children,
}: {
  href: string;
  onOpenNote: (slug: string) => void;
  children: ReactNode;
}) {
  const note = href.match(NOTE_LINK)?.[1];
  if (note) {
    return (
      <button
        type="button"
        className={styles.noteLink}
        onClick={() => onOpenNote(note)}
      >
        {children}
      </button>
    );
  }
  if (href.startsWith("#")) {
    return <>{children}</>;
  }
  return href.startsWith("/") ? (
    <Link href={href} className={styles.noteLink} prefetch={false}>
      {children}
    </Link>
  ) : (
    <a
      href={href}
      className={styles.noteLink}
      target="_blank"
      rel="noopener noreferrer"
    >
      {children}
    </a>
  );
}
