"use client";

import { useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useChatStream } from "@/hooks/use-chat-stream";
import {
  useConversation,
  useCreateConversation,
  conversationKeys,
} from "@/hooks/use-conversations";
import { useChatStore } from "@/stores/chat-store";
import { messagesFromServer } from "@/lib/chat/render";
import { LoadingState } from "@/components/ui/states";
import { MessageBubble } from "./message-bubble";
import { Composer } from "./composer";
import { ChatEmpty } from "./chat-empty";

/**
 * The chat thread — orchestrates server rehydration + live POST-SSE streaming.
 *
 * - Existing conversation: seed from `GET /chat/conversations/:id`, then stream
 *   new turns; after each turn, refetch so persisted tool rows render as rich
 *   cards (the live SSE only carries a short tool summary).
 * - New conversation (`conversationId == null`): show the empty state; the first
 *   send lazily creates a conversation, streams into it, then navigates to its
 *   permanent URL.
 */
export function ChatThread({ conversationId }: { conversationId: string | null }) {
  const router = useRouter();
  const qc = useQueryClient();
  const conv = useConversation(conversationId);
  const createConv = useCreateConversation();
  const consumePendingPrompt = useChatStore((s) => s.consumePendingPrompt);

  const newIdRef = useRef<string | null>(null);
  const seededFor = useRef<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const onConversationNeeded = useCallback(async () => {
    const created = await createConv.mutateAsync(undefined);
    newIdRef.current = created.id;
    return created.id;
  }, [createConv]);

  const { messages, setMessages, streaming, send, stop } = useChatStream({
    conversationId,
    onConversationNeeded,
    onError: (m) => toast.error(m),
  });

  // Seed from the server once per conversation (not while streaming, so a live
  // turn is never clobbered when `streaming` flips back to false).
  useEffect(() => {
    if (!conversationId) {
      seededFor.current = null;
      setMessages([]);
      return;
    }
    if (conv.data && seededFor.current !== conversationId && !streaming) {
      setMessages(messagesFromServer(conv.data));
      seededFor.current = conversationId;
    }
  }, [conversationId, conv.data, streaming, setMessages]);

  // Auto-scroll to the latest message.
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages]);

  const handleSend = useCallback(
    async (text: string) => {
      const wasNew = !conversationId;
      await send(text);

      if (wasNew && newIdRef.current) {
        // Conversation now exists & is persisted — go to its permanent URL.
        qc.invalidateQueries({ queryKey: conversationKeys.all });
        router.replace(`/chat/${newIdRef.current}`);
        return;
      }

      // Existing conversation: pull persisted rows so tool results become cards.
      const fresh = await conv.refetch();
      if (fresh.data) setMessages(messagesFromServer(fresh.data));
      qc.invalidateQueries({ queryKey: conversationKeys.all });
    },
    [conversationId, send, conv, qc, router, setMessages],
  );

  // Consume a prompt handed over from another surface (JobCard "Match CV", etc.)
  useEffect(() => {
    const pending = consumePendingPrompt();
    if (pending) void handleSend(pending);
    // run once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Loading an existing conversation's history.
  if (conversationId && conv.isLoading && messages.length === 0) {
    return <LoadingState label="Loading conversation…" />;
  }

  const showEmpty = messages.length === 0;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {showEmpty ? (
        <ChatEmpty onPick={handleSend} />
      ) : (
        <div ref={scrollRef} className="scroll-area flex-1 px-7 pb-2 pt-3">
          {messages.map((m) => (
            <MessageBubble key={m.id} message={m} />
          ))}
          <div className="h-3" />
        </div>
      )}
      <div className="px-7 pb-5 pt-2">
        <Composer onSend={handleSend} onStop={stop} streaming={streaming} />
      </div>
    </div>
  );
}
