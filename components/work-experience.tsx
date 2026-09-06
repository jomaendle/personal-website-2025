import { H3 } from "@/components/ui/heading";
import { PROJECTS } from "@/lib/state/projects";

/** Selected work as hairline ledger rows, server-rendered. */
export function WorkExperience() {
  return (
    <div className="-mx-3 flex flex-col">
      {PROJECTS.map((project) => (
        <article key={project.id}>
          <a
            href={project.link}
            className="ledger-row group block border-border border-b px-3 py-4"
            target="_blank"
            rel="noopener noreferrer"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <H3>{project.title}</H3>
                <p className="mt-1 text-muted-foreground">
                  {project.description}
                </p>
              </div>
              <span
                aria-hidden="true"
                className="mt-1 shrink-0 font-mono text-muted-foreground transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-brand"
              >
                ↗
              </span>
            </div>
            <span className="sr-only"> (opens in new window)</span>
          </a>
        </article>
      ))}
    </div>
  );
}
