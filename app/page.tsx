import { BlogPosts } from "@/components/blog-posts";
import { CraftsContainer } from "@/components/crafts/CraftsContainer";
import { Minimap } from "@/components/crafts/Minimap";
import { JobPositions } from "@/components/job-positions";
import { NameHeading } from "@/components/name-heading";
import { Footer } from "@/components/ui/footer";
import { H2 } from "@/components/ui/heading";
import { WorkExperience } from "@/components/work-experience";

export const dynamic = "force-static";

export default function Home() {
  return (
    <div className="page-container">
      <div
        className="glass-container mx-auto flex max-w-3xl flex-col gap-10 sm:gap-16"
        style={{ viewTransitionName: "main-content" }}
      >
        {/* The masthead carries the nav, so it is the page banner and sits
            outside `<main>`. */}
        <header>
          <NameHeading showJobTitle={true} />
        </header>

        <main id="main-content" tabIndex={-1} className="flex flex-col gap-16">
          <section>
            <H2>About</H2>
            <div className="flex max-w-[60ch] flex-col gap-5 text-[1.05rem] text-foreground/90 leading-relaxed">
              <p>
                I work on how AI changes the way large teams ship software. I
                came up through the front end, drawn to the point where code
                meets design: years of Angular, then React, more full-stack now.
                I still build all the time, and most of it lately is about
                working well with Claude Code. How a repo is set up, what
                maintenance looks like, what a project needs so the model does
                good work.
              </p>
            </div>
          </section>

          <section>
            <H2>Selected Work</H2>
            <WorkExperience />
          </section>

          <section>
            <H2>Craft</H2>
            <CraftsContainer title="Minimap">
              <Minimap />
            </CraftsContainer>
          </section>

          <section>
            <H2>Writing</H2>
            <BlogPosts />
          </section>

          <section>
            <H2>Experience</H2>
            <JobPositions />
          </section>
        </main>

        <Footer />
      </div>
    </div>
  );
}
