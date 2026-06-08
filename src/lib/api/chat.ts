import { apiFetch, apiUrl } from "./client";
import {
  conversationSchema,
  conversationDetailSchema,
  itemsSchema,
  type Conversation,
  type ConversationDetail,
} from "@/types/api";

export const chatApi = {
  listConversations: () =>
    apiFetch("/chat/conversations", {
      schema: itemsSchema(conversationSchema),
    }).then((r) => r.items),

  getConversation: (id: string): Promise<ConversationDetail> =>
    apiFetch(`/chat/conversations/${id}`, { schema: conversationDetailSchema }),

  createConversation: (title?: string): Promise<Conversation> =>
    apiFetch("/chat/conversations", {
      method: "POST",
      json: title ? { title } : {},
      schema: conversationSchema,
    }),

  deleteConversation: (id: string): Promise<void> =>
    apiFetch(`/chat/conversations/${id}`, { method: "DELETE" }),
};

/** A workspace item the user @-mentioned in a message (resolved server-side). */
export interface MessageReference {
  type: "cv" | "job";
  id: string;
}

/**
 * URL + init for the streaming message POST. The caller opens the stream with
 * `fetch` and reads the body via `readChatSse` (see `lib/sse/parse.ts`); this is
 * not a JSON call, so it doesn't go through `apiFetch`.
 */
export function sendMessageRequest(
  conversationId: string,
  content: string,
  references: MessageReference[] = [],
) {
  return {
    url: apiUrl(`/chat/conversations/${conversationId}/messages`),
    init: {
      method: "POST",
      credentials: "include" as const,
      headers: {
        "Content-Type": "application/json",
        Accept: "text/event-stream",
      },
      body: JSON.stringify(
        references.length ? { content, references } : { content },
      ),
    } satisfies RequestInit,
  };
}
