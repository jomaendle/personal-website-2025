/**
 * The articles as Apple Notes: each post's page.mdx parsed at build time into
 * a small document of note blocks, so the /ios Notes app can show the
 * article itself instead of leaving for the blog.
 *
 * Server-only. Runs inside a statically generated route, so the MDX parser
 * never reaches a browser; the app fetches one small JSON file per note.
 *
 * What a note can't hold (a live demo, a playground) becomes a link card to
 * the article on the site, the way Notes shows a pasted URL. Titles and dates
 * come from `lib/state/blog.ts`, the same source the blog renders from.
 */

import { readFileSync } from "node:fs";
import path from "node:path";
import type {
  BlockContent,
  DefinitionContent,
  ListItem,
  PhrasingContent,
  Root,
  RootContent,
} from "mdast";
import { fromMarkdown } from "mdast-util-from-markdown";
import {
  type MdxJsxAttribute,
  type MdxJsxFlowElement,
  type MdxJsxTextElement,
  mdxFromMarkdown,
} from "mdast-util-mdx";
import { mdxjs } from "micromark-extension-mdxjs";
import { BLOG_POSTS } from "@/lib/state/blog";

export type NoteInline =
  | { t: "text"; v: string }
  | { t: "strong" | "em" | "del"; c: NoteInline[] }
  | { t: "code"; v: string }
  | { t: "link"; href: string; c: NoteInline[] }
  | { t: "br" };

export type NoteBlock =
  | { t: "heading"; level: 2 | 3; c: NoteInline[] }
  | { t: "p"; c: NoteInline[] }
  | { t: "list"; ordered: boolean; start: number; items: NoteBlock[][] }
  | { t: "quote"; c: NoteBlock[] }
  | { t: "code"; lang: string; v: string }
  | { t: "image"; src: string; w: number; h: number; caption: string }
  | { t: "video"; src: string; caption: string; w?: number; h?: number }
  | { t: "baseline"; feature: string }
  | { t: "demo"; label: string }
  | { t: "hr" };

export interface NoteDocument {
  slug: string;
  title: string;
  date: string;
  blocks: NoteBlock[];
}

export interface NoteSummary {
  slug: string;
  title: string;
  date: string;
  /** The first line of body text, for the list's second line. */
  excerpt: string;
}

/** Components that only make sense live. A note links to them instead. */
const DEMO_LABELS: Record<string, string> = {
  CarouselDemo: "Interactive carousel demo",
  CarouselCode: "Carousel source with live preview",
  ScrollButtonAnatomy: "Interactive scroll-button anatomy",
  PopoverPlayground: "Popover playground",
  PopoverCode: "Popover source with live preview",
  FocusZoomAtProperty: "Interactive focus-zoom demo",
  LeanDemo: "Interactive lean demo",
  HoverDemo: "Interactive hover demo",
  ImageStack: "Interactive photo pile",
  Sandpack: "Live code editor",
};

// Read at build time only (the route is fully static). The comment keeps
// Turbopack's file tracer from treating every page.mdx, and through it every
// demo component and stylesheet under app/blog, as part of this route.
const BLOG_DIR = path.join(
  /* turbopackIgnore: true */ process.cwd(),
  "app",
  "blog",
);
const PUBLIC_DIR = path.join(
  /* turbopackIgnore: true */ process.cwd(),
  "public",
);

function parse(slug: string): Root {
  const source = readFileSync(path.join(BLOG_DIR, slug, "page.mdx"), "utf8");
  return fromMarkdown(source, {
    extensions: [mdxjs()],
    mdastExtensions: [mdxFromMarkdown()],
  });
}

const ESCAPED = /\\([`'"\\$])/g;
const ESCAPED_NEWLINE = /\\n/g;
const LEADING_NEWLINES = /^\n+/;
const TRAILING_SPACE = /\s+$/;
const INDENT = /^[ \t]*/;
const COMPONENT_NAME = /^[A-Z]/;
const WHITESPACE = /\s+/g;

// ---- Attribute helpers ----------------------------------------------------

function attribute(
  node: MdxJsxFlowElement | MdxJsxTextElement,
  name: string,
): string | undefined {
  const attr = node.attributes.find(
    (a): a is MdxJsxAttribute =>
      a.type === "mdxJsxAttribute" && a.name === name,
  );
  if (!attr || attr.value == null) {
    return undefined;
  }
  if (typeof attr.value === "string") {
    return attr.value;
  }
  return literal(attr.value.value);
}

/** A string literal or template literal written as a JSX expression, such as
 * `code={`...`}`. Anything else (an identifier, a call) is not knowable at
 * this point and reads as undefined. */
function literal(source: string): string | undefined {
  const s = source.trim();
  const quote = s[0];
  if (s.length < 2 || !(quote === "`" || quote === '"' || quote === "'")) {
    return undefined;
  }
  if (s.at(-1) !== quote) {
    return undefined;
  }
  return s.slice(1, -1).replace(ESCAPED, "$1").replace(ESCAPED_NEWLINE, "\n");
}

/** Template literals in the posts are indented to sit nicely in the MDX
 * source; a note wants the code as written. */
function dedent(code: string): string {
  const lines = code
    .replace(LEADING_NEWLINES, "")
    .replace(TRAILING_SPACE, "")
    .split("\n");
  const indents = lines
    .filter((line) => line.trim())
    .map((line) => line.match(INDENT)?.[0].length ?? 0);
  const cut = indents.length ? Math.min(...indents) : 0;
  return lines.map((line) => line.slice(cut)).join("\n");
}

// ---- Image dimensions -----------------------------------------------------

/** Width and height from a WebP, PNG, JPEG or GIF header, so each note image
 * reserves its space and doesn't shift the text as it loads. */
export function imageSize(publicPath: string): { w: number; h: number } | null {
  let data: Buffer;
  try {
    data = readFileSync(path.join(PUBLIC_DIR, publicPath));
  } catch {
    return null;
  }
  if (data.toString("ascii", 0, 4) === "RIFF") {
    return webpSize(data);
  }
  if (data.readUInt32BE(0) === 0x89504e47) {
    return { w: data.readUInt32BE(16), h: data.readUInt32BE(20) };
  }
  if (data.toString("ascii", 0, 3) === "GIF") {
    return { w: data.readUInt16LE(6), h: data.readUInt16LE(8) };
  }
  if (data[0] === 0xff && data[1] === 0xd8) {
    return jpegSize(data);
  }
  return null;
}

/** Width and height of an MP4's first visual track, from its track header
 * (moov > trak > tkhd, where they sit as 16.16 fixed point in the last eight
 * bytes), so a note's video reserves its space too. */
export function videoSize(publicPath: string): { w: number; h: number } | null {
  let data: Buffer;
  try {
    data = readFileSync(path.join(PUBLIC_DIR, publicPath));
  } catch {
    return null;
  }
  return findTrackSize(data, 0, data.length);
}

const CONTAINERS = new Set(["moov", "trak"]);

/** One MP4 box's type, where its body starts, and its total size; null when
 * the bytes don't hold a well-formed box. */
function readBox(data: Buffer, offset: number, end: number) {
  let size = data.readUInt32BE(offset);
  let header = 8;
  if (size === 1 && offset + 16 <= end) {
    size = Number(data.readBigUInt64BE(offset + 8));
    header = 16;
  } else if (size === 0) {
    size = end - offset;
  }
  if (size < header || offset + size > end) {
    return null;
  }
  return {
    type: data.toString("ascii", offset + 4, offset + 8),
    body: offset + header,
    size,
  };
}

/** The track's display size. The 3x3 matrix just before it says how the
 * frames are turned: with its first entry zero and its second not, they
 * play a quarter turn round (a portrait phone recording), so the box it
 * needs is the other way up. */
function trackHeaderSize(data: Buffer, offset: number, size: number) {
  const w = data.readUInt32BE(offset + size - 8) / 65_536;
  const h = data.readUInt32BE(offset + size - 4) / 65_536;
  if (!(w > 0 && h > 0)) {
    return null;
  }
  const matrix = offset + size - 8 - 36;
  const quarterTurn =
    data.readInt32BE(matrix) === 0 && data.readInt32BE(matrix + 4) !== 0;
  const [dw, dh] = quarterTurn ? [h, w] : [w, h];
  return { w: Math.round(dw), h: Math.round(dh) };
}

function findTrackSize(
  data: Buffer,
  start: number,
  end: number,
): { w: number; h: number } | null {
  let offset = start;
  while (offset + 8 <= end) {
    const box = readBox(data, offset, end);
    if (!box) {
      return null;
    }
    const found =
      box.type === "tkhd"
        ? trackHeaderSize(data, offset, box.size)
        : CONTAINERS.has(box.type)
          ? findTrackSize(data, box.body, offset + box.size)
          : null;
    if (found) {
      return found;
    }
    offset += box.size;
  }
  return null;
}

function webpSize(data: Buffer): { w: number; h: number } | null {
  const chunk = data.toString("ascii", 12, 16);
  if (chunk === "VP8X") {
    return { w: data.readUIntLE(24, 3) + 1, h: data.readUIntLE(27, 3) + 1 };
  }
  if (chunk === "VP8 ") {
    return {
      w: data.readUInt16LE(26) & 0x3fff,
      h: data.readUInt16LE(28) & 0x3fff,
    };
  }
  if (chunk === "VP8L") {
    const bits = data.readUInt32LE(21);
    return { w: (bits & 0x3fff) + 1, h: ((bits >> 14) & 0x3fff) + 1 };
  }
  return null;
}

/** Walk the JPEG segments to the first start-of-frame marker. */
function jpegSize(data: Buffer): { w: number; h: number } | null {
  // SOF0..SOF15, except DHT (C4), JPG (C8) and DAC (CC).
  const isFrame = (marker: number) =>
    marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker);
  let offset = 2;
  while (offset + 9 < data.length) {
    const marker = data[offset + 1] ?? 0;
    if (isFrame(marker)) {
      return {
        h: data.readUInt16BE(offset + 5),
        w: data.readUInt16BE(offset + 7),
      };
    }
    offset += 2 + data.readUInt16BE(offset + 2);
  }
  return null;
}

// ---- mdast → note blocks --------------------------------------------------

function inlines(nodes: PhrasingContent[]): NoteInline[] {
  const out: NoteInline[] = [];
  for (const node of nodes) {
    switch (node.type) {
      case "text":
        out.push({ t: "text", v: node.value });
        break;
      case "strong":
        out.push({ t: "strong", c: inlines(node.children) });
        break;
      case "emphasis":
        out.push({ t: "em", c: inlines(node.children) });
        break;
      case "delete":
        out.push({ t: "del", c: inlines(node.children) });
        break;
      case "inlineCode":
        out.push({ t: "code", v: node.value });
        break;
      case "link":
        out.push({ t: "link", href: node.url, c: inlines(node.children) });
        break;
      case "break":
        out.push({ t: "br" });
        break;
      case "mdxJsxTextElement":
        out.push(...jsxInline(node));
        break;
      default:
        // Expressions such as {metadata.title}, footnote refs, images inline.
        break;
    }
  }
  return out;
}

function jsxInline(node: MdxJsxTextElement): NoteInline[] {
  const children = inlines(node.children as PhrasingContent[]);
  switch (node.name) {
    case "b":
    case "strong":
      return [{ t: "strong", c: children }];
    case "i":
    case "em":
      return [{ t: "em", c: children }];
    case "code":
      return [{ t: "code", v: plainText(children) }];
    case "a": {
      const href = attribute(node, "href");
      return href ? [{ t: "link", href, c: children }] : children;
    }
    case "br":
      return [{ t: "br" }];
    default:
      return children;
  }
}

function plainText(nodes: NoteInline[]): string {
  return nodes
    .map((node) => {
      if (node.t === "text" || node.t === "code") {
        return node.v;
      }
      if (node.t === "br") {
        return " ";
      }
      return plainText(node.c);
    })
    .join("");
}

type FlowNode = RootContent | BlockContent | DefinitionContent | ListItem;

function blocks(nodes: FlowNode[]): NoteBlock[] {
  return nodes.flatMap(block);
}

function block(node: FlowNode): NoteBlock[] {
  switch (node.type) {
    case "heading": {
      // The page's own H1 is the title, which the note already shows.
      if (node.depth === 1) {
        return [];
      }
      return [
        {
          t: "heading",
          level: node.depth === 2 ? 2 : 3,
          c: inlines(node.children),
        },
      ];
    }
    case "paragraph": {
      // A paragraph holding only a JSX element is that element.
      const only = node.children.length === 1 ? node.children[0] : undefined;
      if (
        only?.type === "mdxJsxTextElement" &&
        COMPONENT_NAME.test(only.name ?? "")
      ) {
        return component(only);
      }
      const c = inlines(node.children);
      return plainText(c).trim() ? [{ t: "p", c }] : [];
    }
    case "list":
      return [
        {
          t: "list",
          ordered: Boolean(node.ordered),
          start: node.start ?? 1,
          items: node.children.map((item) => blocks(item.children)),
        },
      ];
    case "blockquote":
      return [{ t: "quote", c: blocks(node.children) }];
    case "code":
      return [{ t: "code", lang: node.lang ?? "", v: node.value }];
    case "thematicBreak":
      return [{ t: "hr" }];
    case "mdxJsxFlowElement":
      return component(node);
    default:
      // mdxjsEsm (imports, metadata), flow expressions, html, definitions.
      return [];
  }
}

type JsxNode = MdxJsxFlowElement | MdxJsxTextElement;

const caption = (node: JsxNode) => (attribute(node, "caption") ?? "").trim();

/** The site's MDX components a note can show natively. */
const NATIVE: Record<string, (node: JsxNode) => NoteBlock[]> = {
  CodeBlock: (node) => {
    const code = attribute(node, "code");
    const lang = attribute(node, "language") ?? "";
    return code ? [{ t: "code", lang, v: dedent(code) }] : [];
  },
  BlogImage: (node) => {
    const src = attribute(node, "src");
    const size = src ? imageSize(src) : null;
    return src && size
      ? [{ t: "image", src, ...size, caption: caption(node) }]
      : [];
  },
  BlogVideo: (node) => {
    const src = attribute(node, "src");
    const size = src ? videoSize(src) : null;
    return src ? [{ t: "video", src, caption: caption(node), ...size }] : [];
  },
  BaselineStatus: (node) => {
    const feature = attribute(node, "featureId");
    return feature ? [{ t: "baseline", feature }] : [];
  },
  // A layout wrapper still holds the article.
  MdxLayout: (node) => blocks(node.children as FlowNode[]),
  // A form has nothing to show in a note.
  ContactForm: () => [],
};

function component(node: JsxNode): NoteBlock[] {
  const name = node.name ?? "";
  const native = NATIVE[name];
  if (native) {
    return native(node);
  }
  const demo = DEMO_LABELS[name];
  if (demo) {
    return [{ t: "demo", label: demo }];
  }
  if (COMPONENT_NAME.test(name)) {
    // An unknown component: say so rather than drop it silently.
    return [{ t: "demo", label: "Interactive example" }];
  }
  // Plain HTML wrappers (div, figure, section): keep what is inside.
  return node.type === "mdxJsxFlowElement"
    ? blocks(node.children as FlowNode[])
    : [{ t: "p", c: inlines(node.children as PhrasingContent[]) }];
}

// ---- Public API -------------------------------------------------------------

/** Published posts only, newest first: the same list the blog shows. */
export const NOTE_SLUGS = BLOG_POSTS.map((post) => post.slug);

export function getNote(slug: string): NoteDocument | null {
  const post = BLOG_POSTS.find((entry) => entry.slug === slug);
  if (!post) {
    return null;
  }
  return {
    slug,
    title: post.title,
    date: post.date,
    blocks: blocks(parse(slug).children),
  };
}

/** First paragraph's text, cut at a word near 140 characters. */
function excerpt(note: NoteDocument): string {
  const first = note.blocks.find((b) => b.t === "p");
  const text =
    first?.t === "p" ? plainText(first.c).replace(WHITESPACE, " ").trim() : "";
  if (text.length <= 140) {
    return text;
  }
  return `${text.slice(0, text.lastIndexOf(" ", 140))}…`;
}

export function getNoteSummaries(): NoteSummary[] {
  return NOTE_SLUGS.flatMap((slug) => {
    const note = getNote(slug);
    return note
      ? [{ slug, title: note.title, date: note.date, excerpt: excerpt(note) }]
      : [];
  });
}
