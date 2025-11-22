"use client";

import React, { useEffect, useState } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { Button } from "@/components/ui/button";
import { AnimatePresence, motion } from "framer-motion";
import { useTheme } from "next-themes";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface CodeBlockProps {
  language: string;
  code: string;
  wrapLines?: boolean;
  collapsible?: boolean;
}

export function CodeBlock({ language, code, wrapLines, collapsible }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [syntaxTheme, setSyntaxTheme] = useState<Record<
    string,
    React.CSSProperties
  > | null>(null);
  const { resolvedTheme } = useTheme();

  // Lazy load syntax highlighter themes based on current theme
  useEffect(() => {
    const loadTheme = async () => {
      if (resolvedTheme === "light") {
        const { oneLight } = await import(
          "react-syntax-highlighter/dist/esm/styles/prism"
        );
        setSyntaxTheme(oneLight);
      } else {
        const { oneDark } = await import(
          "react-syntax-highlighter/dist/esm/styles/prism"
        );
        setSyntaxTheme(oneDark);
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
    >
      {code.trim()}
    </SyntaxHighlighter>
  );

  const content = (
    <div className="code-block group relative my-6 overflow-hidden rounded-lg border border-border/50 bg-muted/30 shadow-sm dark:bg-muted/20">
      <div className="absolute right-12 top-3 z-10 rounded-md border border-border/30 bg-background/90 px-2 py-1 font-mono text-xs text-muted-foreground backdrop-blur-sm">
        {language}
      </div>

      <Button
        variant="ghost"
        size="sm"
        onClick={copyToClipboard}
        className="absolute right-2 top-2 z-20 h-8 w-8 p-0 opacity-100 transition-opacity duration-200 hover:bg-accent md:opacity-0 md:group-hover:opacity-100"
        aria-label="Copy code"
      >
        <AnimatePresence mode="wait">
          {copied ? (
            <motion.svg
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
            </motion.svg>
          ) : (
            <motion.svg
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
            </motion.svg>
          )}
        </AnimatePresence>
      </Button>

      <div
        className={`relative transition-all duration-300 ${
          collapsible && !isOpen ? "max-h-24 overflow-hidden" : ""
        }`}
      >
        {codeContent}

        {collapsible && !isOpen && (
          <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-muted/30 to-transparent dark:from-muted/20" />
        )}
      </div>

      {collapsible && (
        <CollapsibleTrigger asChild>
          <button className="flex w-full items-center justify-center gap-2 border-t border-border/50 bg-muted/20 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted/30 hover:text-foreground">
            <span>{isOpen ? "Collapse" : "Expand"}</span>
            <motion.svg
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
            </motion.svg>
          </button>
        </CollapsibleTrigger>
      )}
    </div>
  );

  if (collapsible) {
    return (
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        {content}
      </Collapsible>
    );
  }

  return content;
}
