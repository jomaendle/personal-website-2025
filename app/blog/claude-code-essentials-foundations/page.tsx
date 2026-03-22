import { CLAUDE_CODE_ESSENTIALS_FOUNDATIONS } from "@/lib/state/blog";
import MdxLayout from "@/components/mdx-layout";
import Content from "./content.mdx";

export const metadata = {
  title: CLAUDE_CODE_ESSENTIALS_FOUNDATIONS.title,
};

export const dynamic = "force-static";

export default function Page() {
  return (
    <MdxLayout
      metadata={{ date: CLAUDE_CODE_ESSENTIALS_FOUNDATIONS.date }}
      slug={CLAUDE_CODE_ESSENTIALS_FOUNDATIONS.slug}
    >
      <Content />
    </MdxLayout>
  );
}
