import { RESPONSIVE_UI_COMPONENTS } from "@/lib/state/blog";
import MdxLayout from "@/components/mdx-layout";
import Content from "./content.mdx";

export const metadata = {
  title: RESPONSIVE_UI_COMPONENTS.title,
};

export const dynamic = "force-static";

export default function Page() {
  return (
    <MdxLayout
      metadata={{ date: RESPONSIVE_UI_COMPONENTS.date }}
      slug={RESPONSIVE_UI_COMPONENTS.slug}
    >
      <Content />
    </MdxLayout>
  );
}
