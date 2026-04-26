---
title: "Making a Next.js Blog Agent-Ready: Subagents, Skills, Hooks, and MCP"
date: "2026-04-26"
category: "docs/solutions/tooling-decisions/"
module: "personal-website-2025/.claude"
problem_type: tooling_decision
component: tooling
severity: low
applies_when:
  - "Adding AI-assisted authoring to a Next.js blog with non-obvious structural conventions"
  - "Codebase has repeating multi-file scaffolding patterns (e.g. blog post = 4 files + array entry)"
  - "Sensitive files (env, secrets) must never be touched by an agent"
  - "Framework conventions diverge from defaults in ways training data won't know"
tags:
  - claude-code
  - agents
  - mcp
  - hooks
  - skills
  - mdx
  - nextjs
  - developer-experience
---

# Making a Next.js Blog Agent-Ready: Subagents, Skills, Hooks, and MCP

## Context

This Next.js 15 personal blog has structural conventions that diverge from framework defaults in ways an AI agent cannot discover from training data alone:

- Blog metadata (title, date, slug) lives in `lib/state/blog.ts` as named exports — **not** in MDX frontmatter
- Code samples in MDX must use a custom `<CodeBlock>` component — **not** markdown triple-backtick fences
- API routes live in `pages/api/` (Pages Router) — **not** `app/api/`
- Blog post pages must export `dynamic = "force-static"`
- Creating a new post requires four consistent artefacts: blog.ts export, BLOG_POSTS array entry, a single `page.mdx` file, and a public assets directory

Without these conventions encoded somewhere the agent can read, every session risks introducing subtle correctness bugs — wrong code block syntax that breaks builds, missing BLOG_POSTS entries that make posts invisible, or API routes that silently fail. The goal of this initiative was to close that gap before handing authoring and maintenance tasks to an agent.

Everything was created in a single session using the `claude-automation-recommender` skill, which analyzed the full codebase (Next.js App Router, Supabase, Resend, MDX, Sandpack, Framer Motion, Prettier with TailwindCSS plugin) and proposed all four components together.

## Guidance

Five artefacts form a layered defence-in-depth stack. Each plays a distinct role.

### 1. Project-conventions skill (passive, always-on)

`.claude/skills/project-conventions/SKILL.md` — set `user-invocable: false` so it is applied automatically, not triggered by the user.

Encodes four convention groups the agent applies silently on every task:

- **Code**: `cn()` from `@/lib/utils` for Tailwind class merging; API routes in `pages/api/`; Supabase at `@/lib/supabaseClient`, Resend at `@/lib/resend`
- **Blog**: always `<CodeBlock language="...">` in MDX, never backtick fences; metadata in `lib/state/blog.ts`; images at `/[slug]/filename.ext` from `public/[slug]/`
- **Design**: dark mode is the baseline; CSS variables from `app/globals.css`; link colors `#2997ff` / `#0070f3`; shadcn/ui patterns
- **Performance**: `export const dynamic = "force-static"` on blog pages; Next.js `<Image>`; Framer Motion + `tailwindcss-motion` only

### 2. New-blog-post skill (active scaffolding)

`.claude/skills/new-blog-post/SKILL.md` — user-invocable, `disable-model-invocation: true` (runs as pure instructions, no model call needed).

Creates all five required artefacts from a slug and title:

**Step 1** — register in `lib/state/blog.ts`:
```ts
export const MY_POST_CONSTANT = {
  title: "The Post Title",
  date: "Mon DD, YYYY",
  slug: "the-post-slug",
};
```
Add `MY_POST_CONSTANT` to the `BLOG_POSTS` array. Constant name = slug in SCREAMING_SNAKE_CASE (hyphens → underscores, all caps).

**Step 2** — create `app/blog/[slug]/page.mdx` (single file, all real posts use this pattern):
```mdx
import { MY_POST_CONSTANT } from "../../../lib/state/blog";
import MdxLayout from "../../../components/mdx-layout";

export const metadata = {
  title: MY_POST_CONSTANT.title,
  date: MY_POST_CONSTANT.date,
};

export const dynamic = "force-static";

# The Post Title

{/* Write your content here */}

export default function Page({ children }) {
  return (
    <MdxLayout metadata={metadata} slug={MY_POST_CONSTANT.slug}>
      {children}
    </MdxLayout>
  );
}
```

Key details: use **relative paths** (`../../../`) not `@/` aliases — the MDX compiler does not resolve `@/` the same way TypeScript does. Use `{/* */}` for comments — HTML `<!-- -->` comments are invalid in MDX and cause a build error (`Unexpected character !`). The `metadata` object includes both `title` and `date` because `MdxLayout` expects the `date` field.

**Step 3** — create `public/[slug]/` directory for assets.

### 3. MDX-content-validator subagent (structural auditing)

`.claude/agents/mdx-content-validator.md` — runs on Haiku (low cost, fast). Given a post slug, it validates:

- `lib/state/blog.ts` has a named export and the constant is in BLOG_POSTS
- `page.mdx` exports `metadata` (with both `title` and `date`), exports `dynamic = "force-static"`, has a default export wrapping content in `MdxLayout` with `metadata` and `slug`
- `page.mdx` uses `<CodeBlock>` (not backtick fences); all used components are imported; image paths follow `/[slug]/filename`
- `public/[slug]/` exists if images are referenced

Output: per-check PASS/FAIL list with exact fix instructions, then "X passed, Y failed" summary.

### 4. Claude Code hooks (automated guardrails)

`.claude/settings.json` — stored at project scope so they are committed and apply to every collaborator.

**PreToolUse** blocks writes to `.env` files (exit code 2 cancels the tool call):
```json
{
  "matcher": "Edit|Write",
  "hooks": [{
    "type": "command",
    "command": "FILE=$(echo \"$CLAUDE_TOOL_INPUT\" | jq -r '.file_path // empty') && if echo \"$FILE\" | grep -qE '\\.env'; then echo 'Blocked: direct edits to .env files are not allowed — edit them manually' && exit 2; fi"
  }]
}
```

Note: `grep -qE '\\.env'` matches any path containing `.env` (e.g. `some.env.config.js`), not only root-level dotenv files. This is intentionally broad — it prevents writes to any file with `.env` in the name. If the codebase ever introduces files with `.env` in their names that the agent should be able to edit, the pattern needs to be tightened (e.g. `grep -qE '(^|/)\.env(\.|$)'`).

**PostToolUse** auto-formats every written file with Prettier (`|| true` ensures a Prettier failure never blocks the agent):
```json
{
  "matcher": "Edit|Write",
  "hooks": [{
    "type": "command",
    "command": "FILE=$(echo \"$CLAUDE_TOOL_INPUT\" | jq -r '.file_path // empty') && [ -n \"$FILE\" ] && npx prettier --write \"$FILE\" 2>/dev/null || true"
  }]
}
```

Note: `settings.json` is committed (project-scoped); `settings.local.json` is gitignored (machine-local). This mirrors the `.env` / `.env.local` convention.

### 5. Context7 MCP server (live documentation)

`.mcp.json` at repo root — project-scoped so it is committed and available to all sessions:
```json
{
  "mcpServers": {
    "context7": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@upstash/context7-mcp"]
    }
  }
}
```

Added with `claude mcp add --scope project context7 -- npx -y @upstash/context7-mcp`. This gives the agent up-to-date documentation for Next.js, Tailwind, Supabase, Resend, and Framer Motion without relying on training data that may be stale.

## Why This Matters

Without encoded conventions, an agent produces plausible but broken output. The most common failure modes for this codebase:

- **Triple-backtick fences in MDX** — the custom renderer does not handle them; the build succeeds but code blocks render incorrectly or break at runtime
- **Missing BLOG_POSTS entries** — posts are invisible on the homepage with no error
- **`app/api/` routes** — silently fail because API routes intentionally use Pages Router

These errors are invisible until build or runtime and look correct to a reader unfamiliar with the project.

The hooks address a different failure mode: **accidental secret exposure**. An agent that can freely write `.env` files is a security liability. The PreToolUse block removes that risk with zero manual review overhead.

Auto-formatting eliminates review friction — generated code that is functionally correct but inconsistently formatted creates noisy diffs.

The combination of:
- conventions skill (passive, always-on → fewer violations created)
- scaffolding skill (active, eliminates blank-slate errors)
- validator agent (auditing, actionable feedback after the fact)
- protective hooks (automated guardrails, no human attention required)
- MCP documentation source (reduces stale-knowledge errors)

produces layered defence-in-depth. The agent is unlikely to create a violation; if it does, the validator surfaces exactly what to fix.

## When to Apply

This pattern is worth setting up when:

- The codebase has non-obvious structural conventions that differ from framework defaults
- Multiple artefacts must be created in lockstep and stay consistent (here: 5 files per blog post)
- Sensitive files exist that an agent should never touch autonomously
- Code formatting consistency matters for PR review hygiene
- Framework dependencies change frequently enough that training-data docs may be stale

Less necessary when the codebase follows framework conventions exactly, has no repeating structural patterns, or is purely read-only from the agent's perspective.

## Examples

**Without agent-ready setup:** Agent creates a new blog post with triple-backtick fences, no `dynamic = "force-static"`, and metadata in MDX frontmatter. Build succeeds, code blocks render incorrectly, page is not statically generated, metadata is silently ignored.

**With skills + validator:**
1. User invokes the `new-blog-post` skill with slug `my-new-post` and title "My New Post"
2. Agent registers `MY_NEW_POST` in `lib/state/blog.ts` and adds it to `BLOG_POSTS`
3. Agent creates `app/blog/my-new-post/page.mdx` from the single-file template
4. Agent creates `public/my-new-post/` directory
6. User or agent dispatches the `mdx-content-validator` agent on `my-new-post`
7. Validator confirms all checks pass — or outputs specific line-level fix instructions

The `.env` protection fires silently if the agent ever attempts to write an env file.

### Known gotchas (session history)

**MDX comment syntax**: HTML comments (`<!-- -->`) are invalid in MDX files — MDX requires JSX comment syntax (`{/* */}`). The `content.mdx` starter template initially used HTML comments and caused a build error (`Unexpected character !`). Verify the `new-blog-post` skill template uses `{/* */}` for any comments in the MDX stub. (session history)

**TypeScript `noUncheckedIndexedAccess`**: This project's `tsconfig.json` has `noUncheckedIndexedAccess: true`, meaning every array index access returns `T | undefined`. Agent-generated code that directly indexes arrays without null guards will fail type-checking. Always use a null check when accessing `BLOG_POSTS` by index:
```ts
const post = BLOG_POSTS[0];
if (post) { /* safe */ }
// or
const post = BLOG_POSTS.at(0);
if (post) { /* safe */ }
```
The `mdx-content-validator` and `new-blog-post` skill should be tested against this when generating TypeScript. (session history)

## Related

- `.claude/agents/mdx-content-validator.md` — the validator subagent
- `.claude/skills/new-blog-post/SKILL.md` — the scaffolding skill
- `.claude/skills/project-conventions/SKILL.md` — the auto-applied conventions
- `.claude/settings.json` — hooks configuration
- `.mcp.json` — Context7 MCP server
