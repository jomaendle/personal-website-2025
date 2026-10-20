import { Link } from "next-view-transitions";
import { CraftsContainer } from "@/components/crafts/CraftsContainer";
import { H3 } from "@/components/ui/heading";
import { CRAFTS } from "@/lib/state/crafts";

/**
 * The homepage Craft section: one craft at full size, the rest as ledger rows.
 *
 * Only the featured craft mounts here. The others are links, so their
 * simulation loops and compositor layers never exist on this page at all.
 */
export function Crafts() {
  const [featured, ...rest] = CRAFTS;
  if (!featured) return null;
  const Featured = featured.component;

  return (
    <div className="flex flex-col">
      <CraftsContainer
        title={featured.title}
        blurb={featured.blurb}
        credit={featured.credit}
        className={featured.height}
      >
        <Featured />
      </CraftsContainer>

      {rest.length > 0 ? (
        <div className="-mx-3 mt-8 flex flex-col">
          {rest.map((craft) => (
            <Link
              key={craft.slug}
              href={`/crafts#${craft.slug}`}
              className="ledger-row group flex items-center gap-4 border-border border-b px-3 py-4"
              prefetch={false}
            >
              <div className="flex-1">
                <H3 className="line-clamp-2">{craft.title}</H3>
                <p className="mt-1 line-clamp-1 text-muted-foreground text-sm">
                  {craft.blurb}
                </p>
              </div>
              <span className="shrink-0 font-mono text-muted-foreground text-xs">
                {craft.year}
              </span>
            </Link>
          ))}
        </div>
      ) : null}

      {/* Only worth offering once there is more than the featured one to see. */}
      {rest.length > 0 ? (
        <Link
          href="/crafts"
          className="mt-6 inline-flex min-h-[44px] w-fit items-center px-3 font-mono text-muted-foreground text-xs uppercase tracking-[0.14em] transition-colors hover:text-brand"
        >
          All crafts
          <span aria-hidden="true" className="ml-1.5">
            →
          </span>
        </Link>
      ) : null}
    </div>
  );
}
