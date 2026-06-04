"use client";

import { useQuery } from "@tanstack/react-query";
import { searchApi } from "@/lib/api/search";

export const searchKeys = {
  history: (limit: number, offset: number) => ["search-history", limit, offset] as const,
  results: (id: string) => ["search-results", id] as const,
};

export function useSearchHistory(limit = 20, offset = 0) {
  return useQuery({
    queryKey: searchKeys.history(limit, offset),
    queryFn: () => searchApi.history(limit, offset),
  });
}

export function useSearchResults(id: string | null) {
  return useQuery({
    queryKey: searchKeys.results(id ?? ""),
    queryFn: () => searchApi.results(id as string),
    enabled: !!id,
  });
}
