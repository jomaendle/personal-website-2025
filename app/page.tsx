import { H2 } from "@/components/ui/heading";
import { JobPositions } from "@/components/job-positions";
import { BlogPosts } from "@/components/blog-posts";
import { WorkExperience } from "@/components/work-experience";
import { MoreLinks } from "@/components/more-links";
import { Footer } from "@/components/ui/footer";
import { NameHeading } from "@/components/name-heading";
import NewsletterForm from "@/components/newsletter";
import { CraftsOverview } from "@/components/crafts/crafts-overview";
import {
  AngularIcon,
  AstroIcon,
  ClaudeCodeIcon,
  JavaScriptIcon,
  ReactIcon,
} from "@/components/ui/framework-icons";

// Static generation
export const dynamic = "force-static";

export default function Home() {
  return (
    <div className="page-container">
      <div
        className="glass-container mx-auto flex max-w-3xl flex-col gap-10 sm:gap-16"
        style={{ viewTransitionName: "main-content" }}
      >
        {/* The masthead carries the nav, so it is the page banner and has to
            sit outside `<main>`. `<main>` is a sibling of it and of the
            footer, and takes over the section rhythm from the container. */}
        <header>
          <NameHeading showJobTitle={true} />
        </header>

        <main id="main-content" tabIndex={-1} className="flex flex-col gap-16">
          <section>
            <H2>Today</H2>
            <p className="text-muted-foreground">
              Building web apps across the JavaScript ecosystem <br />
              <span className="mx-1 mt-2 inline-flex items-center gap-3">
                <ReactIcon size={20} />
                <AngularIcon size={20} />
                <JavaScriptIcon size={20} />
                <AstroIcon size={20} />
              </span>
              <br /> <br />
              <span className="inline-block max-w-lg">
                Right now I&apos;m most interested in how far AI can take the
                day-to-day of building{" "}
                {/* The mark rides along with the last word so it can't wrap onto
                  a line of its own. */}
                <span className="whitespace-nowrap">
                  software.
                  <ClaudeCodeIcon />
                </span>
              </span>
              <br />
              <br />
              {/* No freelance line and no link to /business. That page is
                  deliberately unlisted: reachable by its URL, never from the
                  site's own navigation. See `lib/config/navigation.ts`. */}
              <span className="inline-flex items-center gap-2">
                <span>Let&apos;s connect on </span>
                <a
                  href="https://www.linkedin.com/in/johannes-maendle/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="-m-2 -ml-[10px] inline-flex items-center p-2 pr-0 underline transition-colors hover:text-link"
                >
                  LinkedIn
                </a>
                .
              </span>
            </p>
          </section>

          <section>
            <H2>Selected Work</H2>
            {/* use reduced space because items have padding for hover effect */}
            <div className="space-y-3">
              <WorkExperience />
            </div>
          </section>

          <section>
            <H2>Crafts</H2>
            <div className="space-y-3">
              <CraftsOverview />
            </div>
          </section>

          <section>
            <H2>Articles</H2>
            {/* use reduced space because items have padding for hover effect */}
            <div className="space-y-3">
              <BlogPosts />
            </div>
          </section>

          <section>
            <H2>Experience</H2>
            <div className="space-y-6">
              <JobPositions />
            </div>
          </section>

          <section>
            <H2>More</H2>
            <div className="space-y-2">
              <MoreLinks />
            </div>
          </section>

          <section>
            <NewsletterForm />
          </section>
        </main>

        <Footer />
      </div>
    </div>
  );
}
