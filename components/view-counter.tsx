"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { DEFAULT_STALE_TIME } from "@/lib/queryClient";
import NumberFlow from "@number-flow/react";

interface ViewsResponse {
  views: number;
  slug?: string;
}

// Fetch all views at once
const listAllViewsRequest = async () => {
  return fetch("/api/list-view-count").then(
    (res): Promise<ViewsResponse[]> => res.json(),
  );
};

// Increment view count for a specific slug
const incrementRequest = async (slug: string) => {
  // check if in dev mode
  if (process.env.NODE_ENV === "development") {
    return { views: 0 };
  }

  return fetch("/api/increment-view", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ slug }),
  }).then((res): Promise<ViewsResponse> => res.json());
};

export function ViewCounter({
  slug,
  shouldIncrement,
}: {
  slug: string;
  shouldIncrement?: boolean;
}) {
  // Fetch all views once
  const {
    data: allViews,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["views"],
    queryFn: listAllViewsRequest,
    placeholderData: keepPreviousData,
    staleTime: DEFAULT_STALE_TIME,
  });

  const postViews = allViews?.find((item) => item.slug === slug)?.views || 0;

  // If `shouldIncrement` is true, make a separate mutation request
  const { data: incrementedData } = useQuery({
    queryKey: ["views", slug],
    queryFn: () => incrementRequest(slug),
    enabled: !!slug && shouldIncrement,
    placeholderData: { views: postViews, slug },
    staleTime: 0,
  });

  if (isLoading) {
    return <Loader2 className="animate-spin size-4" />;
  }

  if (error) {
    return <p>-</p>;
  }

  return (
    <p className="text-muted-foreground text-sm flex items-center gap-1">
      <NumberFlow value={incrementedData?.views ?? postViews} /> views
    </p>
  );
}
