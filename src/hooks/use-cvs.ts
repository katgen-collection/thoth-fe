"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { cvsApi } from "@/lib/api/cvs";
import type { Cv } from "@/types/api";

export const cvKeys = {
  all: ["cvs"] as const,
  detail: (id: string) => ["cvs", id] as const,
};

export function useCvs() {
  return useQuery({ queryKey: cvKeys.all, queryFn: cvsApi.list });
}

export function useCv(id: string | null) {
  return useQuery({
    queryKey: cvKeys.detail(id ?? ""),
    queryFn: () => cvsApi.get(id as string),
    enabled: !!id,
  });
}

export function useUploadCv() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => cvsApi.upload(file),
    onSuccess: () => qc.invalidateQueries({ queryKey: cvKeys.all }),
  });
}

export function useDeleteCv() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => cvsApi.remove(id),
    // Optimistically drop the card so the list reacts instantly.
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: cvKeys.all });
      const prev = qc.getQueryData<Cv[]>(cvKeys.all);
      qc.setQueryData<Cv[]>(cvKeys.all, (old) => old?.filter((c) => c.id !== id));
      return { prev };
    },
    onError: (_e, _id, ctx) => {
      if (ctx?.prev) qc.setQueryData(cvKeys.all, ctx.prev);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: cvKeys.all }),
  });
}

export function useSetDefaultCv() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => cvsApi.setDefault(id),
    // Optimistically flip the default flag across the list + detail caches so
    // the "Default" badge moves the instant the user clicks.
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: cvKeys.all });
      const prev = qc.getQueryData<Cv[]>(cvKeys.all);
      qc.setQueryData<Cv[]>(cvKeys.all, (old) =>
        old?.map((c) => ({ ...c, is_default: c.id === id })),
      );
      // Patch any open detail views too.
      prev?.forEach((c) =>
        qc.setQueryData<Cv>(cvKeys.detail(c.id), (d) =>
          d ? { ...d, is_default: c.id === id } : d,
        ),
      );
      return { prev };
    },
    onError: (_e, _id, ctx) => {
      if (ctx?.prev) {
        qc.setQueryData(cvKeys.all, ctx.prev);
        ctx.prev.forEach((c) =>
          qc.setQueryData<Cv>(cvKeys.detail(c.id), (d) =>
            d ? { ...d, is_default: c.is_default } : d,
          ),
        );
      }
    },
    onSettled: () => qc.invalidateQueries({ queryKey: cvKeys.all }),
  });
}
