import { HTML_POPOVER } from "@/lib/state/blog";
import MdxLayout from "@/components/mdx-layout";
import Content from "./content.mdx";

export const metadata = {
  title: HTML_POPOVER.title,
};

export const dynamic = "force-static";

export default function Page() {
  return (
    <MdxLayout
      metadata={{ date: HTML_POPOVER.date }}
      slug={HTML_POPOVER.slug}
    >
      <Content />
    </MdxLayout>
  );
}
