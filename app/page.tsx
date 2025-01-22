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
            I&apos;m a full-stack JavaScript/TypeScript developer based in
            Bremen, Germany, with over 5 years of experience building reliable
            web applications. While I specialize in Angular and UX, I&apos;ve
            also worked with React and Next.js.
          </p>
          <p className="text-muted-foreground mt-4">
            I enjoy creating efficient and user-friendly solutions, and I share
            my knowledge by writing articles about web development.
          </p>
        </section>

        <section>
          <H2>Selected Work</H2>
          <div className="space-y-6">
            <WorkExperience />
          </div>
        </section>

        <section>
          <H2>Articles</H2>
          <div className="space-y-6">
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
