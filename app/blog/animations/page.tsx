import { ANIMATIONS } from "@/lib/state/blog";
import MdxLayout from "@/components/mdx-layout";
import Content from "./content.mdx";

export const metadata = {
  title: ANIMATIONS.title,
};

export const dynamic = "force-static";

export default function Page() {
  return (
    <MdxLayout metadata={{ date: ANIMATIONS.date }} slug={ANIMATIONS.slug}>
      <Content />
    </MdxLayout>
  );
}
