import { FOCUS_ZOOM_MASK_IMAGE } from "@/lib/state/blog";
import MdxLayout from "@/components/mdx-layout";
import Content from "./content.mdx";

export const metadata = {
  title: FOCUS_ZOOM_MASK_IMAGE.title,
};

export const dynamic = "force-static";

export default function Page() {
  return (
    <MdxLayout
      metadata={{ date: FOCUS_ZOOM_MASK_IMAGE.date }}
      slug={FOCUS_ZOOM_MASK_IMAGE.slug}
    >
      <Content />
    </MdxLayout>
  );
}
