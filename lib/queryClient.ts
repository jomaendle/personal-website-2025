import { QueryClient } from "@tanstack/react-query";

export const DEFAULT_STALE_TIME = 60 * 1000 * 5;

export const queryClient = new QueryClient();
