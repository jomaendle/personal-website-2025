"use client";

import { keepPreviousData, useMutation, useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { DEFAULT_STALE_TIME, queryClient } from "@/lib/queryClient";
import NumberFlow from "@number-flow/react";
import { useEffect } from "react";

const isDevelopment = process.env.NODE_ENV === "development";

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
      if (isDevelopment) {
        // In development, skip incrementing views to avoid skewing data
        return { views: allViews ?? 0, slug };
      }

      const res = await fetch("/api/increment-view", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ slug }),
      });

      if (!res.ok) {
        throw new Error(`Failed to increment view: ${res.statusText}`);
      }

      return await res.json();
    },
    onSuccess: (data?: ViewsResponse) => {
      // update the queryClient cache with the new data
      const views = data?.views;
      if (!views) {
        return;
      }

      const currentData: ViewsResponse[] =
        queryClient.getQueryData(["views"]) ?? [];

      // Check if slug exists in current data
      const slugExists = currentData.some((item) => item.slug === slug);

      let updatedData: ViewsResponse[];
      if (slugExists) {
        // Update existing slug
        updatedData = currentData.map((item) =>
          item.slug === slug ? { ...item, views } : item,
        );
      } else {
        // Add new slug to the data
        updatedData = [...currentData, { slug, views }];
      }

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

  if (error) {
    return <p className="text-sm text-muted-foreground">- views</p>;
  }

  // Use incremented data if available, otherwise use fetched data, fallback to 0
  const displayViews = incrementedData?.views ?? allViews ?? 0;

  return (
    <p className="motion-preset-fade-md flex items-center gap-1 text-sm text-muted-foreground">
      <NumberFlow value={displayViews} /> views
    </p>
  );
}
