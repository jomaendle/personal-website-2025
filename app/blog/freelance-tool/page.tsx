import { FREELANCE_TOOL } from "@/lib/state/blog";
import MdxLayout from "@/components/mdx-layout";
import Content from "./content.mdx";

export const metadata = {
  title: FREELANCE_TOOL.title,
};

export const dynamic = "force-static";

export default function Page() {
  return (
    <MdxLayout
      metadata={{ date: FREELANCE_TOOL.date }}
      slug={FREELANCE_TOOL.slug}
    >
      <Content />
    </MdxLayout>
  );
}
