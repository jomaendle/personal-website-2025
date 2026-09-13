"use client";

import { AnimatePresence, m } from "framer-motion";
import dynamic from "next/dynamic";
import { useTheme } from "next-themes";
import type React from "react";
import { useEffect, useId, useState } from "react";
import { Button } from "@/components/ui/button";

/**
 * PrismLight with hand-registered grammars (see syntax-highlighter.tsx) instead
 * of the full Prism build, which carries every bundled grammar (~1.5MB raw) and
 * used to be fetched in full on any article with a code block. `next/dynamic`
 * keeps it in its own chunk fetched when a code block actually renders.
 * `ssr: false` costs nothing here: the component already returns a placeholder
 * until the theme resolves client-side.
 */
const SyntaxHighlighter = dynamic(
  () => import("@/components/syntax-highlighter"),
  { ssr: false },
);

interface CodeBlockProps {
  language: string;
  code: string;
  wrapLines?: boolean;
  collapsible?: boolean;
}

/**
 * Token colours in the two Prism themes that miss WCAG AA on this site's
 * paper, mapped to the same hue and saturation at a lightness that reaches
 * it. The keys are the themes' own strings, which are HSL and not hex: an
 * earlier version of this keyed on hex, matched nothing, and changed no
 * colour at all while looking like it did.
 *
 * one-light and one-dark are drawn for #fafafa and #282c34. This site is
 * cream and near-black. On cream seven of one-light's colours fall under
 * 4.5:1, comments worst at 2.27:1; on the near-black three of one-dark's do.
 * Only lightness moves, so the palette keeps its hues, and every replacement
 * lands between 4.52:1 and 4.70:1 against the background that is actually
 * behind the code rather than the one the themes assume.
 *
 * Applied to the theme object rather than in CSS because the highlighter
 * writes each colour as an inline style and gives every span the same
 * `token` class, so a stylesheet has nothing to target.
 */
const READABLE_TOKENS: Record<string, string> = {
  // one-light, on cream
  "hsl(119, 34%, 47%)": "hsl(119, 34%, 35%)", // strings
  "hsl(198, 99%, 37%)": "hsl(198, 99%, 32%)", // operators
  "hsl(221, 87%, 60%)": "hsl(221, 87%, 53%)", // keywords, functions
  "hsl(230, 1%, 62%)": "hsl(230, 1%, 43%)", // punctuation
  "hsl(230, 4%, 64%)": "hsl(230, 4%, 44%)", // comments
  "hsl(35, 99%, 36%)": "hsl(35, 99%, 31%)", // numbers, constants
  "hsl(5, 74%, 59%)": "hsl(5, 74%, 46%)", // tags, variables
  // one-dark, on near-black
  "hsl(220, 10%, 40%)": "hsl(220, 10%, 52%)", // comments
  "hsl(220, 14%, 45%)": "hsl(220, 14%, 53%)", // punctuation
  "hsl(5, 48%, 51%)": "hsl(5, 48%, 57%)", // deletions
};

/** The same theme with any under-contrast token colour swapped out. */
function readable(
  theme: Record<string, React.CSSProperties>,
): Record<string, React.CSSProperties> {
  const out: Record<string, React.CSSProperties> = {};
  for (const [key, style] of Object.entries(theme)) {
    const colour =
      typeof style?.color === "string"
        ? READABLE_TOKENS[style.color]
        : undefined;
    out[key] = colour ? { ...style, color: colour } : style;
  }
  return out;
}

export function CodeBlock({
  language,
  code,
  wrapLines,
  collapsible,
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const panelId = `code-block-${useId()}`;
  const [syntaxTheme, setSyntaxTheme] = useState<Record<
    string,
    React.CSSProperties
  > | null>(null);
  const { resolvedTheme } = useTheme();

  // Lazy load syntax highlighter themes based on current theme. Import the
  // concrete theme modules — the styles/prism barrel bundles all ~50 themes.
  useEffect(() => {
    const loadTheme = async () => {
      if (resolvedTheme === "light") {
        const { default: oneLight } = await import(
          "react-syntax-highlighter/dist/esm/styles/prism/one-light"
        );
        setSyntaxTheme(readable(oneLight));
      } else {
        const { default: oneDark } = await import(
          "react-syntax-highlighter/dist/esm/styles/prism/one-dark"
        );
        setSyntaxTheme(readable(oneDark));
      }
    };

    loadTheme();
  }, [resolvedTheme]);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(code.trim());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  // Show loading state while theme is being loaded
  if (!syntaxTheme) {
    return (
      <div className="code-block relative my-6 overflow-hidden rounded-lg border border-border bg-secondary">
        <div className="p-6 text-muted-foreground">Loading...</div>
      </div>
    );
  }

  const codeContent = (
    <SyntaxHighlighter
      language={language}
      style={syntaxTheme}
      customStyle={{
        margin: 0,
        padding: "1.5rem",
        fontSize: "0.875rem",
        lineHeight: "1.7",
        background: "transparent",
        borderRadius: "0.5rem",
      }}
      codeTagProps={{
        style: {
          fontFamily:
            'var(--font-geist-mono), ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace',
          fontWeight: 400,
        },
      }}
      showLineNumbers={false}
      wrapLongLines={wrapLines}
      // Long lines scroll sideways, and a region that scrolls has to be
      // reachable by keyboard or the code past the right edge can only be
      // read with a pointer. This lands on the `pre` this renders.
      //
      // Focusable only. A `role="region"` here named every block after its
      // language, so a page with three TypeScript samples had three landmarks
      // called "ts code" and the duplication was itself a violation. The
      // barrier was that the box could not be scrolled from the keyboard,
      // and a tabindex alone fixes that.
      tabIndex={0}
    >
      {code.trim()}
    </SyntaxHighlighter>
  );

  const content = (
    <div className="code-block group relative my-6 overflow-hidden rounded-lg border border-border/50 bg-muted/30 shadow-xs dark:bg-muted/20">
      <div className="absolute top-3 right-12 z-10 rounded-md border border-border/30 bg-background/90 px-2 py-1 font-mono text-muted-foreground text-xs backdrop-blur-xs transition-opacity hover:opacity-0">
        {language}
      </div>

      <Button
        variant="ghost"
        size="sm"
        onClick={copyToClipboard}
        className="absolute top-2 right-2 z-20 h-8 w-8 p-0 opacity-100 transition-opacity duration-200 hover:bg-accent md:opacity-0 md:group-hover:opacity-100"
        aria-label="Copy code"
      >
        <AnimatePresence mode="wait">
          {copied ? (
            <m.svg
              key="check"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="h-4 w-4 text-green-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </m.svg>
          ) : (
            <m.svg
              key="copy"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </m.svg>
          )}
        </AnimatePresence>
      </Button>

      <div
        id={panelId}
        className={`relative ${
          collapsible && !isOpen ? "max-h-24 overflow-hidden" : ""
        }`}
      >
        {codeContent}

        {collapsible && !isOpen && (
          <div className="pointer-events-none absolute right-0 bottom-0 left-0 h-16 bg-linear-to-t from-muted/30 to-transparent dark:from-muted/20" />
        )}
      </div>

      {/* A plain button rather than a Radix CollapsibleTrigger: the collapse is
          a max-height transition on the panel above, not a `CollapsibleContent`,
          so Radix pointed `aria-controls` at an ID nothing ever rendered. */}
      {collapsible ? (
        <button
          type="button"
          aria-expanded={isOpen}
          aria-controls={panelId}
          onClick={() => setIsOpen(!isOpen)}
          className="flex w-full items-center justify-center gap-2 border-border/50 border-t bg-muted/20 py-2 text-muted-foreground text-sm transition-colors hover:bg-muted/30 hover:text-foreground"
        >
          <span>{isOpen ? "Collapse" : "Expand"}</span>
          <m.svg
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.2 }}
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </m.svg>
        </button>
      ) : null}
    </div>
  );

  // The Radix wrapper is gone: with the panel and trigger wired by id above,
  // open state is just `isOpen`, and the collapsed and expanded trees are now
  // identical apart from that class.
  return content;
}
