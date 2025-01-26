import { keepPreviousData, useMutation, useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { DEFAULT_STALE_TIME } from "@/lib/queryClient";
import NumberFlow from "@number-flow/react";
import { useEffect, useState } from "react";

interface ViewsResponse {
  views: number;
  slug?: string;
}

// Fetch all views at once
const listAllViewsRequest = async () =>
  fetch("/api/list-view-count").then(
    (res): Promise<ViewsResponse[]> => res.json(),
  );

export function ViewCounter({
  slug,
  shouldIncrement,
}: {
  slug: string;
  shouldIncrement?: boolean;
}) {
  // Prevent multiple increments per component mount
  const [hasIncremented, setHasIncremented] = useState(false);

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

  // Increment view count for a specific slug
  const incrementRequest = async (slug: string) => {
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

  // Mutation to increment views
  const { mutate, data: incrementedData } = useMutation({
    mutationKey: ["views", slug],
    mutationFn: () => {
      if (!shouldIncrement || hasIncremented) {
        return new Promise<ViewsResponse>((resolve) =>
          resolve({ views: postViews }),
        );
      }

      return incrementRequest(slug);
    },
  });

  // Only trigger increment when `shouldIncrement` is true
  useEffect(() => {
    if (shouldIncrement && !hasIncremented) {
      setHasIncremented(true);
      mutate();
    }
  }, [shouldIncrement, mutate]);

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
