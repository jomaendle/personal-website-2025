"use client";

import { keepPreviousData, useMutation, useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { DEFAULT_STALE_TIME, queryClient } from "@/lib/queryClient";
import NumberFlow from "@number-flow/react";
import { useEffect } from "react";

interface ViewsResponse {
  views: number;
  slug?: string;
}

const listAllViewsRequest = async () => {
  return fetch("/api/list-view-count").then(
    (res): Promise<ViewsResponse[]> => res.json(),
  );
};

export function ViewCounter({
  slug,
  shouldIncrement,
}: {
  slug: string;
  shouldIncrement?: boolean | undefined;
}) {
  // Fetch all views once
  const {
    data: allViews,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["views"],
    queryFn: () => listAllViewsRequest(),
    placeholderData: keepPreviousData,
    staleTime: DEFAULT_STALE_TIME,
    select: (data) => data.find((item) => item.slug === slug)?.views,
  });

  const { data: incrementedData, mutate } = useMutation({
    mutationKey: ["views", slug],
    mutationFn: async () => {
      if (process.env.NODE_ENV === "development") {
        return new Promise<ViewsResponse>((resolve) => resolve({ views: 0 }));
      }

      const res = await fetch("/api/increment-view", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ slug }),
      });
      return await res.json();
    },
    onSettled: (data?: ViewsResponse) => {
      // update the queryClient cache with the new data
      const views = data?.views;
      if (!views) {
        return;
      }

      const currentData: ViewsResponse[] =
        queryClient.getQueryData(["views"]) ?? [];

      const updatedData = currentData.map((item) =>
        item.slug === slug ? { ...item, views } : item,
      );
      queryClient.setQueryData(["views"], updatedData);
    },
  });

  useEffect(() => {
    if (shouldIncrement) {
      mutate();
    }
  }, [shouldIncrement, mutate]);

  if (isLoading) {
    return <Loader2 className="size-4 animate-spin" />;
  }

  if (error || !allViews) {
    return <p>-</p>;
  }

  return (
    <p className="motion-preset-fade-md flex items-center gap-1 text-sm text-muted-foreground">
      <NumberFlow value={incrementedData?.views ?? allViews} /> views
    </p>
  );
}
