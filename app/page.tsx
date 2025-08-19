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
  JavaScriptIcon,
  ReactIcon,
  VueIcon,
} from "@/components/ui/framework-icons";
import { Linkedin } from "lucide-react";

export default function Home() {
  return (
    <main className="px-6 py-16 md:px-16 md:py-24 lg:px-24">
      <div className="mx-auto flex max-w-2xl flex-col gap-16">
        <section>
          <NameHeading showJobTitle={true} />
        </section>

        <section>
          <H2>Today</H2>
          <p className="text-muted-foreground">
            Building modern web applications across the JavaScript ecosystem{" "}
            <br />
            <span className="mx-1 mt-2 inline-flex items-center gap-3">
              <ReactIcon size={20} />
              <VueIcon size={20} />
              <AngularIcon size={20} />
              <JavaScriptIcon size={20} />
              <AstroIcon size={20} />
            </span>
            <br /> <br />
            <span className="inline-block max-w-lg">
              Currently exploring how AI can supercharge development workflows
              and unlock new possibilities.
            </span>
            <br />
            <br />
            <span className="inline-flex flex-col items-baseline gap-2">
              Always up for collaborating on interesting projects.
              <br />
              <span className="mt-2 inline-flex items-center gap-2">
                <span>Let&apos;s connect on </span>
                <a
                  href="https://www.linkedin.com/in/johannes-maendle/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center p-2 text-link transition-colors hover:text-link-hover"
                >
                  <Linkedin className="relative -left-1 -top-0.5 size-5 shrink-0" />
                </a>
              </span>
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

        <Footer />
      </div>
    </main>
  );
}
