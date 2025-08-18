import { QueryClient } from "@tanstack/react-query";

// Longer stale time for better caching (10 minutes)
export const DEFAULT_STALE_TIME = 60 * 1000 * 10;

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Improved caching configuration
      staleTime: DEFAULT_STALE_TIME,
      gcTime: 60 * 1000 * 30, // Keep in cache for 30 minutes
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchOnReconnect: true,
      retry: 1, // Only retry once to avoid delays
      retryDelay: 1000,
    },
    mutations: {
      retry: 1,
      retryDelay: 1000,
    },
  },
});
