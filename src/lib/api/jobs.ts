import { apiFetch } from "./client";
import {
  savedJobSchema,
  analyzeUrlSchema,
  interviewPrepSchema,
  itemsSchema,
  type SavedJob,
  type SavedJobStatus,
  type AnalyzeUrlResult,
  type InterviewPrep,
} from "@/types/api";

export interface SaveJobInput {
  title: string;
  company?: string;
  location?: string;
  description?: string;
  apply_link?: string;
}

export const jobsApi = {
  listSaved: (status?: SavedJobStatus) =>
    apiFetch("/jobs/saved", {
      query: { status },
      schema: itemsSchema(savedJobSchema),
    }).then((r) => r.items),

  save: (input: SaveJobInput): Promise<SavedJob> =>
    apiFetch("/jobs/save", { method: "POST", json: input, schema: savedJobSchema }),

  updateStatus: (id: string, status: SavedJobStatus): Promise<SavedJob> =>
    apiFetch(`/jobs/saved/${id}/status`, {
      method: "PATCH",
      json: { status },
      schema: savedJobSchema,
    }),

  remove: (id: string): Promise<void> =>
    apiFetch(`/jobs/saved/${id}`, { method: "DELETE" }),

  analyzeUrl: (url: string): Promise<AnalyzeUrlResult> =>
    apiFetch("/jobs/analyze-url", {
      method: "POST",
      json: { url },
      schema: analyzeUrlSchema,
    }),

  interviewPrep: (id: string): Promise<InterviewPrep> =>
    apiFetch(`/jobs/saved/${id}/interview-prep`, {
      method: "POST",
      schema: interviewPrepSchema,
    }),
};
