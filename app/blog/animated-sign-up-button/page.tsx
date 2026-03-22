import { ANIMATED_SIGN_UP_BUTTON } from "@/lib/state/blog";
import MdxLayout from "@/components/mdx-layout";
import Content from "./content.mdx";

export const metadata = {
  title: ANIMATED_SIGN_UP_BUTTON.title,
};

export const dynamic = "force-static";

export default function Page() {
  return (
    <MdxLayout
      metadata={{ date: ANIMATED_SIGN_UP_BUTTON.date }}
      slug={ANIMATED_SIGN_UP_BUTTON.slug}
    >
      <Content />
    </MdxLayout>
  );
}
