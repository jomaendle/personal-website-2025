import { CodeBlock } from "@/components/code-block";
import Link from "next/link";

interface BlogPostProps {
  params: {
    slug: string;
  };
}

export default function BlogPost({ params }: BlogPostProps) {
  return (
    <main className="px-6 py-16 md:px-16 md:py-24 lg:px-24">
      <div className="max-w-2xl mx-auto">
        <Link
          href="/"
          className="inline-block text-sm text-muted-foreground hover:text-primary transition-colors mb-16"
        >
          ← Back
        </Link>

        <article className="prose prose-invert">
          <h1 className="text-2xl font-normal tracking-tight mb-8">
            Invisible Details of Interaction Design
          </h1>

          <p>
            Design can feel like there's no science to it — only feel and
            intuition. Even researchers have trouble grounding interaction
            design practices in science, inherently treating them as a
            mysterious black box. While from my own experience that's partly
            true, I have been trying to deconstruct and dig out the why behind
            great displays of interaction design.
          </p>

          <p>
            Searching the Internet for depth on interaction design yields a
            plethora of recycled content obsessing over user personas,
            storyboards, and Venn diagrams labeled with "UI" and "UX". Besides a
            few exceptional talks, actual substance and insight reveal
            themselves to those willing to fanatically dig for them. Either
            through studying obscure, long-winded research papers or by
            maniacally replaying hundreds of slow motion screen recordings.
          </p>

          <CodeBlock
            language="css"
            code={`
.interaction {
  transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.interaction:hover {
  transform: scale(1.02);
}

@media (prefers-reduced-motion: reduce) {
  .interaction {
    transition: none;
  }
}`}
          />

          <p>
            Sitting down and just thinking hard does not magically produce
            valuable discoveries either. The essence of the word "interaction"
            implies a relationship between a human and an environment. In my
            experience, great revelations surface from making something —
            filling your headspace with a problem — and then going for a
            synthesising daydreaming walk to stir the pot.
          </p>
        </article>
      </div>
    </main>
  );
}
