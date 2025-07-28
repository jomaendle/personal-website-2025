import { H2 } from "@/components/ui/heading";
import { JobPositions } from "@/components/job-positions";
import { BlogPosts } from "@/components/blog-posts";
import { WorkExperience } from "@/components/work-experience";
import { MoreLinks } from "@/components/more-links";
import { Footer } from "@/components/ui/footer";
import { NameHeading } from "@/components/name-heading";
import NewsletterForm from "@/components/newsletter";
import { CraftsOverview } from "@/components/crafts/crafts-overview";

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
            Full-stack developer specializing in React, TypeScript, and modern
            web architectures. <br />
            I help startups and enterprises build scalable products that users
            love and businesses depend on. <br />
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
