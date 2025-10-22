"use client";

import React, { useState, useEffect } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "next-themes";

interface CodeBlockProps {
  language: string;
  code: string;
}

export function CodeBlock({ language, code }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const [syntaxTheme, setSyntaxTheme] = useState<any>(null);
  const { resolvedTheme } = useTheme();

  // Lazy load syntax highlighter themes based on current theme
  useEffect(() => {
    const loadTheme = async () => {
      if (resolvedTheme === "light") {
        const { vs } = await import(
          "react-syntax-highlighter/dist/esm/styles/prism"
        );
        setSyntaxTheme(vs);
      } else {
        const { dracula } = await import(
          "react-syntax-highlighter/dist/esm/styles/prism"
        );
        setSyntaxTheme(dracula);
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

  return (
    <div className="code-block relative my-6 overflow-hidden rounded-lg border border-border bg-secondary group">
      <div className="absolute right-12 top-3 rounded-md bg-background/80 px-2 py-1 font-mono text-xs text-muted-foreground backdrop-blur-sm">
        {language}
      </div>

      <Button
        variant="ghost"
        size="sm"
        onClick={copyToClipboard}
        className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 h-8 w-8 p-0"
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

      <SyntaxHighlighter
        language={language}
        style={syntaxTheme}
        customStyle={{
          margin: 0,
          padding: "1.5rem 1rem",
          fontSize: "0.875rem",
          lineHeight: "1.5",
          background: "transparent",
        }}
      >
        {code.trim()}
      </SyntaxHighlighter>
    </div>
  );
}
