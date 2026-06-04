import { apiFetch, apiUrl } from "./client";
import {
  cvSchema,
  cvMatchSchema,
  coverLetterSchema,
  suggestEditsSchema,
  itemsSchema,
  type Cv,
  type CvMatch,
  type CoverLetter,
  type SuggestEdits,
} from "@/types/api";

export const cvsApi = {
  list: () =>
    apiFetch("/cvs", { schema: itemsSchema(cvSchema) }).then((r) => r.items),

  get: (id: string): Promise<Cv> => apiFetch(`/cvs/${id}`, { schema: cvSchema }),

  upload: (file: File): Promise<Cv> => {
    const form = new FormData();
    form.append("file", file);
    return apiFetch("/cvs", { method: "POST", formData: form, schema: cvSchema });
  },

  remove: (id: string): Promise<void> =>
    apiFetch(`/cvs/${id}`, { method: "DELETE" }),

  setDefault: (id: string): Promise<void> =>
    apiFetch(`/cvs/${id}/default`, { method: "PATCH" }),

  analyze: (id: string): Promise<Cv> =>
    apiFetch(`/cvs/${id}/analyze`, { method: "POST", schema: cvSchema }),

  /** GET /cvs/:id/download — 307s to a short-lived presigned URL. */
  downloadUrl: (id: string): string => apiUrl(`/cvs/${id}/download`),

  match: (jobDescription: string, cvId?: string): Promise<CvMatch> =>
    apiFetch("/cvs/match", {
      method: "POST",
      json: { cv_id: cvId, job_description: jobDescription },
      schema: cvMatchSchema,
    }),

  coverLetter: (id: string, jobDescription: string): Promise<CoverLetter> =>
    apiFetch(`/cvs/${id}/cover-letter`, {
      method: "POST",
      json: { job_description: jobDescription },
      schema: coverLetterSchema,
    }),

  suggestEdits: (id: string, jobDescription: string): Promise<SuggestEdits> =>
    apiFetch(`/cvs/${id}/suggest-edits`, {
      method: "POST",
      json: { job_description: jobDescription },
      schema: suggestEditsSchema,
    }),
};
