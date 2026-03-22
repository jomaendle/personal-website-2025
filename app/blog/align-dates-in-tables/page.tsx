import { ALIGN_DATES_IN_TABLES } from "@/lib/state/blog";
import MdxLayout from "@/components/mdx-layout";
import Content from "./content.mdx";

export const metadata = {
  title: ALIGN_DATES_IN_TABLES.title,
};

export const dynamic = "force-static";

export default function Page() {
  return (
    <MdxLayout
      metadata={{ date: ALIGN_DATES_IN_TABLES.date }}
      slug={ALIGN_DATES_IN_TABLES.slug}
    >
      <Content />
    </MdxLayout>
  );
}
