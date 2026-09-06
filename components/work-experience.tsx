import { H3 } from "@/components/ui/heading";
import { PROJECTS } from "@/lib/state/projects";

/**
 * Selected work as hairline ledger rows (`.ledger-row` in
 * `app/editorial-theme.css`). Server-rendered: the list is data, and it must
 * be readable before any JavaScript arrives.
 */
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
                <H3 className="flex flex-wrap items-center">
                  {project.title}
                  {/* Inside the H3 so a screen reader hears the caveat with
                      the title. */}
                  {project.status ? (
                    <span className="ml-2 inline-flex shrink-0 items-center rounded-[0.2rem] border border-border-strong px-1.5 py-0.5 font-mono text-[0.6rem] text-muted-foreground uppercase tracking-[0.12em]">
                      {project.status}
                    </span>
                  ) : null}
                </H3>
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
