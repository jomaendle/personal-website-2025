import React from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

interface CodeBlockProps {
  language: string;
  code: string;
}

export function CodeBlock({ language, code }: CodeBlockProps) {
  return (
    <div className="relative rounded-[0.25rem] overflow-hidden code-block my-6">
      <div className="absolute top-0 right-0 bg-neutral-800 text-gray-300 px-2 py-1 text-xs font-mono rounded-bl">
        {language}
      </div>
      <SyntaxHighlighter
        language={language}
        style={vscDarkPlus}
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
