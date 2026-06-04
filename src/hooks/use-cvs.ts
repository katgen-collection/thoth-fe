"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { cvsApi } from "@/lib/api/cvs";

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
    onSuccess: () => qc.invalidateQueries({ queryKey: cvKeys.all }),
  });
}

export function useSetDefaultCv() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => cvsApi.setDefault(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: cvKeys.all }),
  });
}
