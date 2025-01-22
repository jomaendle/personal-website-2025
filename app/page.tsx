import { H2 } from "@/components/ui/heading";
import { JobPositions } from "@/components/job-positions";
import { BlogPosts } from "@/components/blog-posts";
import { WorkExperience } from "@/components/work-experience";
import { MoreLinks } from "@/components/more-links";
import { Footer } from "@/components/ui/footer";
import { NameHeading } from "@/components/name-heading";

export default function Home() {
  return (
    <main className="px-6 py-16 md:px-16 md:py-24 lg:px-24">
      <div className="max-w-2xl mx-auto flex flex-col gap-16">
        <section>
          <NameHeading />
        </section>

        <section>
          <H2>Today</H2>
          <p className="text-muted-foreground">
            I&apos;m a full-stack JavaScript/TypeScript developer with a passion
            for frontend, design, animations, and user experience.
          </p>
          <p className="text-muted-foreground mt-4">
            I enjoy building web applications and websites and to share my
            knowledge with the community.
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

        <Footer />
      </div>
    </main>
  );
}
