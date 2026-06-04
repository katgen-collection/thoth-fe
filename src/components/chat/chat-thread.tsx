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
import { chatApi } from "@/lib/api/chat";
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

  // The moment a brand-new conversation exists, surface it in the sidebar right
  // away (it streams into the current view in place). We defer the URL swap to
  // its permanent path until the stream finishes — navigating mid-stream would
  // remount this component and abort the in-flight SSE.
  const onConversationCreated = useCallback(
    (id: string) => {
      newIdRef.current = id;
      qc.invalidateQueries({ queryKey: conversationKeys.all });
    },
    [qc],
  );

  const { messages, setMessages, streaming, send, stop } = useChatStream({
    conversationId,
    onConversationNeeded,
    onConversationCreated,
    onError: (m) => toast.error(m),
  });

  // Seed from the server once per conversation (not while streaming, so a live
  // turn is never clobbered when `streaming` flips back to false).
  useEffect(() => {
    if (!conversationId) {
      // A new conversation may have been created mid-session (URL swapped via
      // history.replaceState while the prop stays null) — don't wipe its thread.
      if (newIdRef.current) return;
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
      await send(text);

      // Reconcile with the persisted conversation so tool rows render as the
      // exact same rich cards (and the title settles). Live SSE already showed
      // them, so this is a silent correctness pass — no manual reload needed.
      const id = conversationId ?? newIdRef.current;
      if (!id) return;
      try {
        const fresh = await qc.fetchQuery({
          queryKey: conversationKeys.detail(id),
          queryFn: () => chatApi.getConversation(id),
        });
        if (fresh) setMessages(messagesFromServer(fresh));
        seededFor.current = id;
      } catch {
        /* keep the live-streamed view if the reconcile fetch fails */
      }
      qc.invalidateQueries({ queryKey: conversationKeys.all });

      // New conversation: now that streaming is done, move to its permanent URL.
      // The detail query is already cached above, so the remount re-seeds
      // instantly with no flicker — and the route tree stays in sync with the
      // URL (so "New chat" and refreshes behave correctly).
      if (!conversationId && newIdRef.current) {
        router.replace(`/chat/${newIdRef.current}`);
      }
    },
    [conversationId, send, qc, router, setMessages],
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
