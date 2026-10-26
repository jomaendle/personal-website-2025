"use client";

import NumberFlow from "@number-flow/react";
import { Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { fetchAllViews, incrementView } from "@/lib/views";

export function ViewCounter({
  slug,
  shouldIncrement,
}: {
  slug: string;
  shouldIncrement?: boolean | undefined;
}) {
  const [views, setViews] = useState<number | null>(null);
  const [hasError, setHasError] = useState(false);
  // Once the increment response lands, the (possibly cached, pre-increment)
  // list response must not overwrite it — the old react-query code had the
  // same precedence via `incrementedData?.views ?? allViews`.
  const hasIncrementedValue = useRef(false);

  useEffect(() => {
    let cancelled = false;

    fetchAllViews()
      .then((all) => {
        if (!(cancelled || hasIncrementedValue.current)) {
          setViews(all.find((item) => item.slug === slug)?.views ?? 0);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setHasError(true);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [slug]);

  useEffect(() => {
    if (!shouldIncrement) {
      return;
    }
    incrementView(slug).then((total) => {
      // The displayed count otherwise stays at the pre-increment value.
      if (total) {
        hasIncrementedValue.current = true;
        setViews(total);
      }
    });
  }, [shouldIncrement, slug]);

  if (hasError) {
    return <p className="text-muted-foreground text-sm">- views</p>;
  }

  if (views === null) {
    return <Loader2 className="size-4 animate-spin" />;
  }

  return (
    <p className="motion-preset-fade-md flex items-center gap-1 text-muted-foreground text-sm">
      <NumberFlow value={views} /> views
    </p>
  );
}
