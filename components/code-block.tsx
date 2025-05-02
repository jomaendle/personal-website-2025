import React from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { dracula } from "react-syntax-highlighter/dist/esm/styles/prism";

interface CodeBlockProps {
  language: string;
  code: string;
}

export function CodeBlock({ language, code }: CodeBlockProps) {
  return (
    <div className="code-block relative my-6 overflow-hidden rounded-md border border-neutral-700 bg-neutral-900">
      <div className="absolute right-0 top-0 rounded-bl-lg bg-neutral-800 px-2 py-1 font-mono text-xs text-gray-300">
        {language}
      </div>
      <SyntaxHighlighter
        language={language}
        style={dracula}
        customStyle={{
          margin: 0,
          padding: "1.5rem 1rem",
          fontSize: "0.875rem",
          lineHeight: "1.5",
        }}
      >
        {code.trim()}
      </SyntaxHighlighter>
    </div>
  );
}
