"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { DEFAULT_STALE_TIME } from "@/lib/queryClient";
import NumberFlow from "@number-flow/react";

interface ViewsResponse {
  views: number;
  slug?: string;
}

const incrementRequest = async (slug: string) => {
  return fetch("/api/increment-view", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ slug }),
  }).then(async (res): Promise<ViewsResponse> => await res.json());
};

const listAllViewsRequest = async (slug: string) => {
  return fetch("/api/list-view-count")
    .then((res): Promise<ViewsResponse[]> => res.json())
    .then((data) => data.find((item) => item.slug === slug));
};

export function ViewCounter({
  slug,
  shouldIncrement,
}: {
  slug: string;
  shouldIncrement?: boolean;
}) {
  const { data, isLoading, error } = useQuery({
    queryKey: ["views", slug],
    queryFn: () =>
      shouldIncrement ? incrementRequest(slug) : listAllViewsRequest(slug),
    enabled: !!slug,
    placeholderData: keepPreviousData,
    staleTime: shouldIncrement ? 0 : DEFAULT_STALE_TIME,
    select: (data) => data,
  });

  if (isLoading) {
    return <Loader2 className="animate-spin size-4" />;
  }

  if (error || !data) {
    return <p>-</p>;
  }

  return (
    <p className="text-muted-foreground text-sm">
      <NumberFlow value={data?.views} /> views
    </p>
  );
}
