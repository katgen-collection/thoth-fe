"use client";

import { useCallback, useRef, useState } from "react";
import { sendMessageRequest } from "@/lib/api/chat";
import { readChatSse } from "@/lib/sse/parse";
import { parseToolResult } from "@/lib/chat/render";
import type { ChatSseEvent } from "@/types/sse";
import type { AssistantBlock, ChatMessage } from "@/types/chat";

let idSeq = 0;
const nextId = () => `m${Date.now().toString(36)}-${idSeq++}`;

/* ------------------------------------------------------------------ */
/* Hook                                                               */
/* ------------------------------------------------------------------ */

export interface UseChatStreamOptions {
  conversationId: string | null;
  initialMessages?: ChatMessage[];
  /** Called the first time a message is sent in a brand-new conversation. */
  onConversationNeeded?: () => Promise<string>;
  /**
   * Fired right after a brand-new conversation is created (before any tokens
   * stream), so the UI can swap to its permanent URL seamlessly.
   */
  onConversationCreated?: (id: string) => void;
  onError?: (message: string) => void;
}

export function useChatStream({
  conversationId,
  initialMessages = [],
  onConversationNeeded,
  onConversationCreated,
  onError,
}: UseChatStreamOptions) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [streaming, setStreaming] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const convRef = useRef<string | null>(conversationId);

  /** Mutate the last (assistant) message's blocks immutably. */
  const updateLastBlocks = useCallback(
    (fn: (blocks: AssistantBlock[]) => AssistantBlock[]) => {
      setMessages((prev) => {
        if (prev.length === 0) return prev;
        const next = [...prev];
        const last = { ...next[next.length - 1] };
        last.blocks = fn((last.blocks ?? []).map((b) => ({ ...b })));
        next[next.length - 1] = last;
        return next;
      });
    },
    [],
  );

  const reduceEvent = useCallback(
    (event: ChatSseEvent) => {
      switch (event.type) {
        case "text":
          updateLastBlocks((blocks) => {
            const last = blocks[blocks.length - 1];
            if (last && last.kind === "text" && last.streaming) {
              last.content += event.content;
            } else {
              blocks.push({ kind: "text", content: event.content, streaming: true });
            }
            return blocks;
          });
          break;

        case "tool_call":
          // Freeze any open text block, then add a running tool chip.
          updateLastBlocks((blocks) => {
            const last = blocks[blocks.length - 1];
            if (last && last.kind === "text") last.streaming = false;
            blocks.push({
              kind: "tool",
              tool: event.tool,
              args: event.args,
              status: "Starting…",
              progress: 4,
              done: false,
            });
            return blocks;
          });
          break;

        case "tool_progress":
          updateLastBlocks((blocks) => {
            const tool = [...blocks].reverse().find((b) => b.kind === "tool" && !b.done);
            if (tool && tool.kind === "tool") {
              tool.status = event.status;
              tool.progress = event.progress;
            }
            return blocks;
          });
          break;

        case "tool_result":
          updateLastBlocks((blocks) => {
            const tool = [...blocks]
              .reverse()
              .find((b) => b.kind === "tool" && b.tool === event.tool && !b.done);
            if (tool && tool.kind === "tool") {
              tool.done = true;
              tool.progress = 100;
              tool.summary = event.summary;
              // Render the rich result card immediately — no refetch needed.
              if (event.result != null) {
                tool.result = parseToolResult(event.tool, event.result);
              }
            }
            return blocks;
          });
          break;

        case "done":
          updateLastBlocks((blocks) => {
            for (const b of blocks) if (b.kind === "text") b.streaming = false;
            return blocks;
          });
          break;

        case "error":
          updateLastBlocks((blocks) => {
            for (const b of blocks) if (b.kind === "text") b.streaming = false;
            return blocks;
          });
          onError?.(event.error);
          break;
      }
    },
    [updateLastBlocks, onError],
  );

  const send = useCallback(
    async (content: string) => {
      const text = content.trim();
      if (!text || streaming) return;

      // Ensure we have a conversation to post into.
      let convId = convRef.current;
      if (!convId) {
        if (!onConversationNeeded) {
          onError?.("No conversation to send to");
          return;
        }
        try {
          convId = await onConversationNeeded();
          convRef.current = convId;
          onConversationCreated?.(convId);
        } catch {
          onError?.("Could not start a conversation");
          return;
        }
      }

      // Optimistic user bubble + empty assistant turn.
      setMessages((prev) => [
        ...prev,
        { id: nextId(), role: "user", text },
        {
          id: nextId(),
          role: "assistant",
          blocks: [{ kind: "text", content: "", streaming: true }],
        },
      ]);
      setStreaming(true);

      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const { url, init } = sendMessageRequest(convId, text);
        const response = await fetch(url, { ...init, signal: controller.signal });
        if (!response.ok) {
          throw new Error(`Stream failed (${response.status})`);
        }
        await readChatSse(response, reduceEvent, controller.signal);
      } catch (err) {
        if (!controller.signal.aborted) {
          onError?.(err instanceof Error ? err.message : "Streaming error");
          updateLastBlocks((blocks) => {
            for (const b of blocks) if (b.kind === "text") b.streaming = false;
            return blocks;
          });
        }
      } finally {
        // Finalize any block left mid-stream.
        updateLastBlocks((blocks) => {
          for (const b of blocks) if (b.kind === "text") b.streaming = false;
          return blocks;
        });
        setStreaming(false);
        abortRef.current = null;
      }
    },
    [streaming, reduceEvent, updateLastBlocks, onConversationNeeded, onConversationCreated, onError],
  );

  const stop = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    setStreaming(false);
  }, []);

  return { messages, setMessages, streaming, send, stop };
}
