import { cn } from "@/lib/utils";

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-muted/50", className)}
      {...props}
    />
  );
}

function SandpackSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn("w-full", className)}
      style={{ contain: "layout style paint" }}
    >
      <div className="flex h-[400px] overflow-hidden rounded-lg border border-border bg-background">
        {/* Editor Side */}
        <div className="flex w-1/2 flex-col">
          {/* Tab Bar */}
          <div className="flex h-10 items-center border-border border-b bg-muted/30 px-3">
            <Skeleton className="h-4 w-16" />
          </div>
          {/* Editor Content */}
          <div className="flex-1 space-y-2 p-4">
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-4/5" />
            <Skeleton className="h-3 w-3/4" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-2/3" />
            <Skeleton className="h-3 w-5/6" />
            <Skeleton className="h-3 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>

        {/* Preview Side */}
        <div className="flex w-1/2 flex-col border-border border-l">
          {/* Preview Header */}
          <div className="flex h-10 items-center border-border border-b bg-muted/30 px-3">
            <Skeleton className="h-4 w-12" />
          </div>
          {/* Preview Content */}
          <div className="flex-1 bg-background p-4">
            <Skeleton className="h-32 w-full rounded" />
          </div>
        </div>
      </div>
    </div>
  );
}

function BaselineStatusSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "relative mb-8 rounded-[.25rem] border border-border bg-card",
        "min-h-[200px] sm:min-h-[160px] md:min-h-[128px]",
        className,
      )}
      style={{ contain: "layout style paint" }}
    >
      <div className="flex h-full items-center justify-center p-6">
        <div className="w-full max-w-lg space-y-4">
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
          <div className="flex gap-2 pt-2">
            <Skeleton className="h-8 w-20 rounded-full" />
            <Skeleton className="h-8 w-16 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Height the giscus iframe settles at once loaded, in px.
 *
 * Measured against production at both 500px and 1280px viewport widths — the
 * empty state is width-independent (a reaction bar, a comment-count row and
 * the comment box all stack at fixed heights), so one number covers every
 * breakpoint. Reserving it in the *server-rendered* parent is what buys the
 * zero CLS: the lazy comment component is `ssr: false`, so nothing about it
 * reaches the prerendered HTML and a reservation made inside it would arrive
 * too late to stop the page from growing.
 *
 * Posts that already have comments still exceed this and shift by the
 * difference. That is unavoidable client-side — the count isn't known until
 * giscus answers — and it is still far better than growing from zero.
 */
const GISCUS_MIN_HEIGHT = 372;

function GiscusSkeleton({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn("w-full", className)}
      style={{ contain: "layout style paint" }}
    >
      {/* Reaction pills */}
      <div className="mb-4 flex gap-2">
        <Skeleton className="size-9 rounded-full" />
        <Skeleton className="size-9 rounded-full" />
        <Skeleton className="size-9 rounded-full" />
      </div>

      {/* "N Comments" heading */}
      <Skeleton className="mb-4 h-5 w-28" />

      {/* Comment box, with its Write/Preview tab row */}
      <div className="rounded-md border border-border">
        <div className="flex gap-3 border-border border-b px-3 py-2">
          <Skeleton className="h-5 w-14" />
          <Skeleton className="h-5 w-16" />
        </div>
        <div className="space-y-3 p-3">
          <Skeleton className="h-20 w-full rounded" />
          <div className="flex justify-end">
            <Skeleton className="h-8 w-28 rounded-md" />
          </div>
        </div>
      </div>
    </div>
  );
}

// `Skeleton` stays module-local: it is the shared shimmer block the exported
// skeletons are built from, and has no consumers of its own.
export {
  BaselineStatusSkeleton,
  GISCUS_MIN_HEIGHT,
  GiscusSkeleton,
  SandpackSkeleton,
};
