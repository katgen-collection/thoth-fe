/**
 * Zod schemas + inferred types mirroring the backend contract.
 *
 * Hand-kept in sync with `backend-go/docs/api-reference.md`. This file is the
 * single source of truth for API shapes on the frontend — no imports from
 * `backend-go/`, so the eventual repo split is a clean `git` move.
 */
import { z } from "zod";

/* ------------------------------------------------------------------ */
/* Chat                                                               */
/* ------------------------------------------------------------------ */

export const conversationSchema = z.object({
  id: z.string(),
  user_id: z.string(),
  title: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
});
export type Conversation = z.infer<typeof conversationSchema>;

export const messageRoleSchema = z.enum(["user", "assistant", "tool"]);
export type MessageRole = z.infer<typeof messageRoleSchema>;

export const messageSchema = z.object({
  id: z.string(),
  conversation_id: z.string(),
  role: messageRoleSchema,
  content: z.string(),
  tool_name: z.string().optional().nullable(),
  tool_args: z.unknown().optional().nullable(),
  tool_result: z.unknown().optional().nullable(),
  search_job_id: z.string().optional().nullable(),
  created_at: z.string().optional(),
});
export type Message = z.infer<typeof messageSchema>;

export const conversationDetailSchema = z.object({
  conversation: conversationSchema,
  messages: z.array(messageSchema),
});
export type ConversationDetail = z.infer<typeof conversationDetailSchema>;

/* ------------------------------------------------------------------ */
/* Search / jobs (results that flow through the search_jobs tool)      */
/* ------------------------------------------------------------------ */

export const jobResultSchema = z.object({
  title: z.string(),
  company: z.string(),
  location: z.string(),
  description_snippet: z.string(),
  apply_link: z.string(),
  relevance_score: z.number(), // 6–10
});
export type JobResult = z.infer<typeof jobResultSchema>;

export const searchStatusSchema = z.enum([
  "pending",
  "extracting",
  "fetching_jobs",
  "ai_filtering",
  "completed",
  "failed",
]);
export type SearchStatus = z.infer<typeof searchStatusSchema>;

export const searchJobSchema = z.object({
  id: z.string(),
  user_id: z.string(),
  query: z.string(),
  status: searchStatusSchema,
  progress: z.number(),
  extracted_params: z.record(z.string(), z.unknown()).optional().nullable(),
  result: z.array(jobResultSchema).optional().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
});
export type SearchJob = z.infer<typeof searchJobSchema>;

export const searchHistorySchema = z.object({
  items: z.array(searchJobSchema),
  total: z.number(),
  limit: z.number(),
  offset: z.number(),
});
export type SearchHistory = z.infer<typeof searchHistorySchema>;

/* ------------------------------------------------------------------ */
/* CVs                                                                */
/* ------------------------------------------------------------------ */

export const cvStatusSchema = z.enum(["uploaded", "processing", "ready", "failed"]);
export type CvStatus = z.infer<typeof cvStatusSchema>;

export const cvExperienceSchema = z.object({
  role: z.string().optional(),
  company: z.string().optional(),
  period: z.string().optional(),
  bullets: z.array(z.string()).optional(),
});

export const cvEducationSchema = z.object({
  degree: z.string().optional(),
  school: z.string().optional(),
  period: z.string().optional(),
});

export const parsedCvSchema = z.object({
  name: z.string().optional(),
  email: z.string().optional(),
  phone: z.string().optional(),
  summary: z.string().optional(),
  skills: z.array(z.string()).optional(),
  experience: z.array(cvExperienceSchema).optional(),
  education: z.array(cvEducationSchema).optional(),
});
export type ParsedCv = z.infer<typeof parsedCvSchema>;

export const cvSchema = z.object({
  id: z.string(),
  user_id: z.string(),
  filename: z.string(),
  file_size: z.number(),
  mime_type: z.string(),
  sha256: z.string(),
  status: cvStatusSchema,
  is_default: z.boolean(),
  created_at: z.string(),
  updated_at: z.string(),
  // present on the full GET /cvs/:id record
  extracted_text: z.string().optional().nullable(),
  parsed_data: parsedCvSchema.optional().nullable(),
});
export type Cv = z.infer<typeof cvSchema>;

export const cvMatchSchema = z.object({
  score: z.number(),
  summary: z.string(),
  strengths: z.array(z.string()),
  gaps: z.array(z.string()),
});
export type CvMatch = z.infer<typeof cvMatchSchema>;

export const coverLetterSchema = z.object({ cover_letter: z.string() });
export type CoverLetter = z.infer<typeof coverLetterSchema>;

export const cvEditSchema = z.object({
  section: z.string(),
  current: z.string(),
  suggested: z.string(),
  reason: z.string(),
});
export const suggestEditsSchema = z.object({
  summary: z.string(),
  edits: z.array(cvEditSchema),
});
export type SuggestEdits = z.infer<typeof suggestEditsSchema>;

/* ------------------------------------------------------------------ */
/* Saved jobs (tracker)                                               */
/* ------------------------------------------------------------------ */

export const savedJobStatusSchema = z.enum([
  "saved",
  "applied",
  "interview",
  "offer",
  "rejected",
]);
export type SavedJobStatus = z.infer<typeof savedJobStatusSchema>;

export const savedJobSchema = z.object({
  id: z.string(),
  user_id: z.string(),
  title: z.string(),
  company: z.string().optional().nullable(),
  location: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  apply_link: z.string().optional().nullable(),
  source: z.string().optional().nullable(),
  status: savedJobStatusSchema,
  notes: z.string().optional().nullable(),
  applied_at: z.string().optional().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
});
export type SavedJob = z.infer<typeof savedJobSchema>;

export const analyzeUrlSchema = z.object({
  title: z.string(),
  company: z.string().optional().nullable(),
  location: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  apply_link: z.string().optional().nullable(),
  summary: z.string().optional().nullable(),
});
export type AnalyzeUrlResult = z.infer<typeof analyzeUrlSchema>;

export const interviewPrepSchema = z.object({ interview_prep: z.string() });
export type InterviewPrep = z.infer<typeof interviewPrepSchema>;

/* ------------------------------------------------------------------ */
/* Generic list wrapper                                               */
/* ------------------------------------------------------------------ */

export function itemsSchema<T extends z.ZodTypeAny>(item: T) {
  return z.object({ items: z.array(item) });
}
