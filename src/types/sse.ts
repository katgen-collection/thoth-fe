/**
 * The chat SSE event union.
 *
 * Mirrors the `type`-tagged frames documented in
 * `backend-go/docs/chat-and-tools.md`. Each SSE frame is one JSON object on a
 * `data:` line, with `type` always present.
 */

export interface SseTextEvent {
  type: "text";
  content: string;
}

export interface SseToolCallEvent {
  type: "tool_call";
  tool: string;
  args: unknown; // raw JSON the model passed
}

export interface SseToolProgressEvent {
  type: "tool_progress";
  status: string; // e.g. "extracting", "fetching_jobs", "ai_filtering"
  progress: number; // 0–100
}

export interface SseToolResultEvent {
  type: "tool_result";
  tool: string;
  summary: string; // short human line
}

export interface SseDoneEvent {
  type: "done";
}

export interface SseErrorEvent {
  type: "error";
  error: string;
}

export type ChatSseEvent =
  | SseTextEvent
  | SseToolCallEvent
  | SseToolProgressEvent
  | SseToolResultEvent
  | SseDoneEvent
  | SseErrorEvent;

/** Narrowing helper: validate a parsed frame is a known chat event. */
export function isChatSseEvent(value: unknown): value is ChatSseEvent {
  if (!value || typeof value !== "object") return false;
  const t = (value as { type?: unknown }).type;
  return (
    t === "text" ||
    t === "tool_call" ||
    t === "tool_progress" ||
    t === "tool_result" ||
    t === "done" ||
    t === "error"
  );
}
