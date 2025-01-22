"use client";

import { useQuery } from "@tanstack/react-query";

export const ViewCounter = ({ slug }: { slug: string }) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["views", slug],
    queryFn: () =>
      fetch("/api/increment-view", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ slug }),
      }).then((res): Promise<{ views: number }> => res.json()),
    enabled: !!slug,
    staleTime: 60 * 1000,
  });

  if (isLoading) {
    return <p>Loading views...</p>;
  }

  if (error) {
    return <p>Error loading views: {error.message}</p>;
  }

  return <p>{data?.views} views</p>;
};
