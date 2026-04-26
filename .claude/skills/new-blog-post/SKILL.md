---
name: new-blog-post
description: Scaffold a new blog post — creates the directory structure, content.mdx, page.tsx, registers the metadata in lib/state/blog.ts, and creates the public assets folder
disable-model-invocation: true
---

Scaffold a new blog post for this personal website. If the slug and title are not provided as arguments, ask for them.

## Step 1 — Register metadata in `lib/state/blog.ts`

Add a new named constant export near the top of the BLOG_POSTS list. Follow the exact pattern of existing entries:

```ts
export const MY_POST_CONSTANT = {
  title: "The Post Title",
  date: "Mon DD, YYYY",
  slug: "the-post-slug",
};
```

Then add `MY_POST_CONSTANT` to the `BLOG_POSTS` array. The array already sorts by date, so position doesn't matter.

> Naming convention: constant name is the slug in SCREAMING_SNAKE_CASE (hyphens → underscores, all caps).

## Step 2 — Create `app/blog/[slug]/page.tsx`

Use this exact template (replace placeholders):

```tsx
import { MY_POST_CONSTANT } from "@/lib/state/blog";
import MdxLayout from "@/components/mdx-layout";
import Content from "./content.mdx";

export const metadata = {
  title: MY_POST_CONSTANT.title,
};

export const dynamic = "force-static";

export default function Page() {
  return (
    <MdxLayout
      metadata={{ date: MY_POST_CONSTANT.date }}
      slug={MY_POST_CONSTANT.slug}
    >
      <Content />
    </MdxLayout>
  );
}
```

## Step 3 — Create `app/blog/[slug]/content.mdx`

Create the file with just the post title as an H1 to start:

```mdx
# The Post Title

<!-- Write your content here -->
```

**Important conventions:**
- Use `<CodeBlock language="ts">` (or appropriate language) for ALL code samples — never markdown triple-backtick fences
- Images reference `/[slug]/filename.ext` (served from `public/[slug]/`)

## Step 4 — Create public assets folder

Create the directory `public/[slug]/` so assets can be added later.

## Step 5 — Report

List the files created/modified:
- `lib/state/blog.ts` (modified — added export + BLOG_POSTS entry)
- `app/blog/[slug]/page.tsx` (created)
- `app/blog/[slug]/content.mdx` (created)
- `public/[slug]/` (created)

Remind that the post will appear on the homepage automatically via the sorted BLOG_POSTS array.
