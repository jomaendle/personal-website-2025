"use client";

import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

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
    return <Loader2 className="animate-spin size-4" />;
  }

  if (error) {
    return <p>-</p>;
  }

  return <p className="text-muted-foreground">{data?.views} views</p>;
};
