import type { Metadata } from "next";
import { CraftsContainer } from "@/components/crafts/CraftsContainer";
import { Footer } from "@/components/ui/footer";
import { H1 } from "@/components/ui/heading";
import { PageTopBar } from "@/components/ui/page-top-bar";
import { CRAFTS } from "@/lib/state/crafts";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Crafts",
  description:
    "Small interactive pieces, and what each one does when you touch it.",
};

export default function CraftsPage() {
  return (
    <div className="page-container">
      <div
        className="glass-container mx-auto flex max-w-3xl flex-col gap-10 sm:gap-16"
        style={{ viewTransitionName: "main-content" }}
      >
        {/* Landmark contract matches /blog: PageTopBar's <header> and <Footer />
            are siblings of <main>, never inside it. */}
        <PageTopBar currentPath="/crafts" />

        <main id="main-content" tabIndex={-1} className="flex flex-col gap-16">
          <header className="flex flex-col gap-5">
            <p className="mb-6 font-mono text-brand text-xs uppercase tracking-[0.16em]">
              Crafts
            </p>
            <H1 className="max-w-[18ch]">
              Small interactive pieces I built for the web.
            </H1>
          </header>

          {/* Every craft mounts here, so each one gates its own loop on being
              scrolled into view. None of them animate off screen. */}
          <div className="flex flex-col gap-16">
            {CRAFTS.map((craft) => {
              const Component = craft.component;
              return (
                <section
                  key={craft.slug}
                  id={craft.slug}
                  className="scroll-mt-24"
                >
                  <CraftsContainer
                    title={craft.title}
                    blurb={craft.blurb}
                    credit={craft.credit}
                    className={craft.height}
                  >
                    <Component />
                  </CraftsContainer>
                </section>
              );
            })}
          </div>
        </main>

        <Footer />
      </div>
    </div>
  );
}
