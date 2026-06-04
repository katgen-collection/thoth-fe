"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { jobsApi, type SaveJobInput } from "@/lib/api/jobs";
import type { SavedJob, SavedJobStatus } from "@/types/api";

export const jobKeys = {
  all: ["saved-jobs"] as const,
  byStatus: (status?: SavedJobStatus) => ["saved-jobs", status ?? "all"] as const,
};

export function useSavedJobs(status?: SavedJobStatus) {
  return useQuery({
    queryKey: jobKeys.byStatus(status),
    queryFn: () => jobsApi.listSaved(status),
  });
}

export function useSaveJob() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: SaveJobInput) => jobsApi.save(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: jobKeys.all }),
  });
}

export function useUpdateJobStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: SavedJobStatus }) =>
      jobsApi.updateStatus(id, status),
    // Optimistic move across the board.
    onMutate: async ({ id, status }) => {
      await qc.cancelQueries({ queryKey: jobKeys.all });
      const snapshots = qc.getQueriesData<SavedJob[]>({ queryKey: jobKeys.all });
      for (const [key, list] of snapshots) {
        if (!list) continue;
        qc.setQueryData<SavedJob[]>(
          key,
          list.map((j) => (j.id === id ? { ...j, status } : j)),
        );
      }
      return { snapshots };
    },
    onError: (_err, _vars, ctx) => {
      ctx?.snapshots.forEach(([key, list]) => qc.setQueryData(key, list));
    },
    onSettled: () => qc.invalidateQueries({ queryKey: jobKeys.all }),
  });
}

export function useDeleteSavedJob() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => jobsApi.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: jobKeys.all }),
  });
}
