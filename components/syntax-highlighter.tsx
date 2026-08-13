"use client";

import bash from "react-syntax-highlighter/dist/esm/languages/prism/bash";
import css from "react-syntax-highlighter/dist/esm/languages/prism/css";
import javascript from "react-syntax-highlighter/dist/esm/languages/prism/javascript";
import json from "react-syntax-highlighter/dist/esm/languages/prism/json";
import jsx from "react-syntax-highlighter/dist/esm/languages/prism/jsx";
import markdown from "react-syntax-highlighter/dist/esm/languages/prism/markdown";
import markup from "react-syntax-highlighter/dist/esm/languages/prism/markup";
import tsx from "react-syntax-highlighter/dist/esm/languages/prism/tsx";
import typescript from "react-syntax-highlighter/dist/esm/languages/prism/typescript";
// Import the concrete module, not the package barrel: the index re-exports
// the full `Prism` build too, and pulling PrismLight through it risks
// bundling every grammar this file exists to avoid.
import PrismLight from "react-syntax-highlighter/dist/esm/prism-light";

// The full Prism build bundles every grammar (~1.5MB of JS shipped to every
// article with a code block). PrismLight starts empty, so only the grammars
// registered here end up in the chunk. When an article introduces a new
// language, register it here — unknown languages render as plain text.
PrismLight.registerLanguage("markup", markup);
PrismLight.registerLanguage("html", markup);
PrismLight.registerLanguage("css", css);
PrismLight.registerLanguage("javascript", javascript);
PrismLight.registerLanguage("js", javascript);
PrismLight.registerLanguage("typescript", typescript);
PrismLight.registerLanguage("ts", typescript);
PrismLight.registerLanguage("jsx", jsx);
PrismLight.registerLanguage("tsx", tsx);
PrismLight.registerLanguage("markdown", markdown);
PrismLight.registerLanguage("bash", bash);
PrismLight.registerLanguage("json", json);

export default PrismLight;
