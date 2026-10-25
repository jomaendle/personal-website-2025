"use client";

import { useDeferredValue, useState } from "react";
import { BLOG_POSTS } from "@/lib/state/blog";
import { categoryFor } from "@/lib/state/writing-categories";
import { cn } from "@/lib/utils";
import type { AppProps } from "../apps";
import { Compose, Magnifier } from "../glyphs";
import styles from "../iphone.module.css";
import { Group, NavBar, Row } from "./ui";

const year = (date: string) => new Date(date).getFullYear();

/** My articles as a Notes folder, grouped by year like Notes does. Each note
 * opens the article itself. */
export default function NotesApp(_: AppProps) {
  const [query, setQuery] = useState("");
  const deferred = useDeferredValue(query.trim().toLowerCase());
  const posts = deferred
    ? BLOG_POSTS.filter((post) => post.title.toLowerCase().includes(deferred))
    : BLOG_POSTS;
  const years = [...new Set(posts.map((post) => year(post.date)))];

  return (
    <div className={styles.notes}>
      <div className={cn(styles.scroll, styles.scrollWithBar)}>
        <NavBar title="Writing" />
        <p className={styles.subtitle}>
          {posts.length} {posts.length === 1 ? "Note" : "Notes"}
        </p>

        {years.map((y) => (
          <Group key={y} header={String(y)} large>
            {posts
              .filter((post) => year(post.date) === y)
              .map((post) => (
                <Row
                  key={post.slug}
                  href={`/blog/${post.slug}`}
                  chevron={false}
                  bold
                  title={post.title}
                  detail={`${post.date}\u2002${categoryFor(post.slug)}`}
                />
              ))}
          </Group>
        ))}
        {posts.length === 0 && <p className={styles.empty}>No Results</p>}
      </div>

      {/* iOS 26 moved search to the bottom, in a floating glass field. */}
      <div className={styles.floatingBar}>
        <label className={styles.glassField}>
          <Magnifier />
          <span className="sr-only">Search articles</span>
          <input
            type="search"
            placeholder="Search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            autoComplete="off"
            enterKeyHint="search"
          />
        </label>
        <span
          className={cn(
            styles.glassButton,
            styles.glassButtonLarge,
            styles.tinted,
          )}
          aria-hidden
        >
          <Compose />
        </span>
      </div>
    </div>
  );
}
