import { cn } from "@/lib/utils";

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-muted/50",
        className
      )}
      {...props}
    />
  );
}

function SkeletonText({
  lines = 3,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { lines?: number }) {
  return (
    <div className={cn("space-y-2", className)} {...props}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn(
            "h-4",
            i === lines - 1 ? "w-3/4" : "w-full"
          )}
        />
      ))}
    </div>
  );
}

function SkeletonCard({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("space-y-3", className)} {...props}>
      <Skeleton className="h-[200px] w-full rounded-xl" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    </div>
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
          <div className="flex h-10 items-center border-b border-border bg-muted/30 px-3">
            <Skeleton className="h-4 w-16" />
          </div>
          {/* Editor Content */}
          <div className="flex-1 p-4 space-y-2">
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
        <div className="flex w-1/2 flex-col border-l border-border">
          {/* Preview Header */}
          <div className="flex h-10 items-center border-b border-border bg-muted/30 px-3">
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
        className
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

export { Skeleton, SkeletonText, SkeletonCard, SandpackSkeleton, BaselineStatusSkeleton };