/**
 * The *rendered* chat model — the shape the UI reduces SSE frames and persisted
 * rows into. Distinct from the wire types in `api.ts` / `sse.ts`.
 */
import type {
  JobResult,
  CvMatch,
  SuggestEdits,
  SavedJob,
  AnalyzeUrlResult,
} from "./api";

/** Structured payload parsed from a persisted `tool_result`, keyed by tool. */
export type ParsedToolResult =
  | { kind: "jobs"; jobs: JobResult[] }
  | { kind: "match"; match: CvMatch }
  | { kind: "cover_letter"; text: string }
  | { kind: "suggest_edits"; data: SuggestEdits }
  | { kind: "saved_jobs"; jobs: SavedJob[] }
  | { kind: "analyze_url"; data: AnalyzeUrlResult }
  | { kind: "interview_prep"; text: string }
  | { kind: "text"; text: string };

/** Blocks compose an assistant turn: prose, a tool chip, and its result. */
export type AssistantBlock =
  | { kind: "text"; content: string; streaming: boolean }
  | {
      kind: "tool";
      tool: string;
      args?: unknown;
      status: string;
      progress: number;
      done: boolean;
      summary?: string;
      /** Present when rehydrated from a persisted tool row (rich cards). */
      result?: ParsedToolResult | null;
    };

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  /** user messages carry plain text; assistant messages carry blocks. */
  text?: string;
  blocks?: AssistantBlock[];
}
