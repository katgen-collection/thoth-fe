/**
 * Map persisted conversation rows into the rendered chat model.
 *
 * The backend persists `tool` rows (with a `tool_result` Raw payload) for
 * display even though it doesn't replay them to the model. We rehydrate them
 * into the *same* block components a live turn produces, so a reopened
 * conversation looks identical to one that just streamed.
 */
import { z } from "zod";
import {
  jobResultSchema,
  cvMatchSchema,
  suggestEditsSchema,
  savedJobSchema,
  analyzeUrlSchema,
} from "@/types/api";
import type { ConversationDetail, Message } from "@/types/api";
import type { AssistantBlock, ChatMessage, ParsedToolResult } from "@/types/chat";

let idSeq = 0;
const rid = () => `s${idSeq++}`;

const jobsSchema = z.array(jobResultSchema);
const savedJobsSchema = z.array(savedJobSchema);

/** Best-effort parse of a persisted `tool_result` into a typed card payload. */
export function parseToolResult(
  toolName: string | null | undefined,
  raw: unknown,
): ParsedToolResult | null {
  if (raw == null) return null;

  switch (toolName) {
    case "search_jobs": {
      const r = jobsSchema.safeParse(raw);
      if (r.success) return { kind: "jobs", jobs: r.data };
      // Some backends wrap as { result: [...] }
      const wrapped = z.object({ result: jobsSchema }).safeParse(raw);
      if (wrapped.success) return { kind: "jobs", jobs: wrapped.data.result };
      break;
    }
    case "match_cv_to_job": {
      const r = cvMatchSchema.safeParse(raw);
      if (r.success) return { kind: "match", match: r.data };
      break;
    }
    case "suggest_cv_edits": {
      const r = suggestEditsSchema.safeParse(raw);
      if (r.success) return { kind: "suggest_edits", data: r.data };
      break;
    }
    case "get_saved_jobs": {
      const r = savedJobsSchema.safeParse(raw);
      if (r.success) return { kind: "saved_jobs", jobs: r.data };
      break;
    }
    case "analyze_job_url": {
      const r = analyzeUrlSchema.safeParse(raw);
      if (r.success) return { kind: "analyze_url", data: r.data };
      break;
    }
    case "generate_cover_letter": {
      const r = z.object({ cover_letter: z.string() }).safeParse(raw);
      if (r.success) return { kind: "cover_letter", text: r.data.cover_letter };
      if (typeof raw === "string") return { kind: "cover_letter", text: raw };
      break;
    }
    case "prep_interview": {
      const r = z.object({ interview_prep: z.string() }).safeParse(raw);
      if (r.success) return { kind: "interview_prep", text: r.data.interview_prep };
      if (typeof raw === "string") return { kind: "interview_prep", text: raw };
      break;
    }
  }

  if (typeof raw === "string") return { kind: "text", text: raw };
  return null;
}

function toolBlock(msg: Message): AssistantBlock {
  return {
    kind: "tool",
    tool: msg.tool_name ?? "tool",
    args: msg.tool_args ?? undefined,
    status: "Done",
    progress: 100,
    done: true,
    summary: msg.content || undefined,
    result: parseToolResult(msg.tool_name, msg.tool_result),
  };
}

/** Convert ordered server messages into grouped, render-ready chat messages. */
export function messagesFromServer(detail: ConversationDetail): ChatMessage[] {
  const out: ChatMessage[] = [];
  let current: ChatMessage | null = null;

  const flush = () => {
    if (current && current.blocks && current.blocks.length > 0) out.push(current);
    current = null;
  };

  for (const msg of detail.messages) {
    if (msg.role === "user") {
      flush();
      out.push({ id: msg.id || rid(), role: "user", text: msg.content });
      continue;
    }

    // assistant or tool — merge into one assistant turn until the next user msg.
    if (!current) current = { id: msg.id || rid(), role: "assistant", blocks: [] };

    if (msg.role === "assistant") {
      if (msg.content.trim()) {
        current.blocks!.push({ kind: "text", content: msg.content, streaming: false });
      }
    } else if (msg.role === "tool") {
      current.blocks!.push(toolBlock(msg));
    }
  }
  flush();

  return out;
}
