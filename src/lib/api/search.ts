import { apiFetch } from "./client";
import { searchJobSchema, searchHistorySchema, type SearchJob } from "@/types/api";

/**
 * Search resource — the *non-streaming* surface only.
 *
 * Live search happens inside chat (the `search_jobs` tool streams progress into
 * the chat SSE), so the FE never uses `search/initiate` + `search/stream/:id`.
 * The History page reads these stored records instead.
 */
export const searchApi = {
  history: (limit = 20, offset = 0) =>
    apiFetch("/search/history", {
      query: { limit, offset },
      schema: searchHistorySchema,
    }),

  results: (taskId: string): Promise<SearchJob> =>
    apiFetch(`/search/results/${taskId}`, { schema: searchJobSchema }),
};
