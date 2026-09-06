import { BlogPosts } from "@/components/blog-posts";
import { CraftsOverview } from "@/components/crafts/crafts-overview";
import { NameHeading } from "@/components/name-heading";
import NewsletterForm from "@/components/newsletter";
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
            <H2>Now</H2>
            <div className="flex max-w-[56ch] flex-col gap-4 text-[1.05rem] text-foreground/90 leading-relaxed">
              <p>
                I work on how AI changes the way large teams ship software:
                architecture, tooling, daily habits.
              </p>
              <p>
                Years of front-end work in Angular, then React, more full-stack
                now. I still build for the web, and write about it here.
              </p>
            </div>
          </section>

          <section>
            <H2>Selected Work</H2>
            <WorkExperience />
          </section>

          <section>
            <H2>Crafts</H2>
            <CraftsOverview />
          </section>

          <section>
            <H2>Writing</H2>
            <BlogPosts />
          </section>

          <NewsletterForm />
        </main>

        <Footer />
      </div>
    </div>
  );
}
