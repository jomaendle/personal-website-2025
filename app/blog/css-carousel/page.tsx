import { CSS_CAROUSEL } from "@/lib/state/blog";
import MdxLayout from "@/components/mdx-layout";
import Content from "./content.mdx";

export const metadata = {
  title: CSS_CAROUSEL.title,
};

export const dynamic = "force-static";

export default function Page() {
  return (
    <MdxLayout
      metadata={{ date: CSS_CAROUSEL.date }}
      slug={CSS_CAROUSEL.slug}
    >
      <Content />
    </MdxLayout>
  );
}
