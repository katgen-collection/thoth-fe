"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useChatStream } from "@/hooks/use-chat-stream";
import type { MessageReference } from "@/lib/api/chat";
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
  const consumePendingDraft = useChatStore((s) => s.consumePendingDraft);

  // A prompt the user still has to finish (e.g. paste a job posting). Pre-fills
  // the composer instead of auto-sending. Consumed once on mount; the key bump
  // re-seeds the (otherwise mount-only) composer value.
  const [draft, setDraft] = useState("");
  const [composerKey, setComposerKey] = useState(0);
  const seedDraft = useCallback((text: string) => {
    setDraft(text);
    setComposerKey((k) => k + 1);
  }, []);

  // Id of a conversation we created during the current new-chat turn, before its
  // URL has been swapped in. Used to stop the seed effect from wiping the live
  // thread while `conversationId` (the prop) is still null.
  const pendingNewId = useRef<string | null>(null);
  // Conversation whose thread is currently displayed (server-seeded or live).
  const seededFor = useRef<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const onConversationNeeded = useCallback(async () => {
    const created = await createConv.mutateAsync(undefined);
    pendingNewId.current = created.id;
    return created.id;
  }, [createConv]);

  // The moment a brand-new conversation exists, surface it in the sidebar right
  // away. The turn keeps streaming into the current view in place; we swap to
  // its permanent URL only once the stream finishes (see handleSend), so the
  // single mounted ChatThread is never torn down mid-flight.
  const onConversationCreated = useCallback(
    (id: string) => {
      pendingNewId.current = id;
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

  // Once the URL has caught up to the conversation we just created, the pending
  // marker has done its job — clear it so a later "New chat" (prop → null) can
  // reset the thread instead of being treated as the mid-turn window.
  useEffect(() => {
    if (conversationId && pendingNewId.current === conversationId) {
      pendingNewId.current = null;
    }
  }, [conversationId]);

  // Keep the displayed thread in sync with the route, without ever clobbering a
  // live turn. Because `/chat` and `/chat/:id` are the same mounted component,
  // this also handles switching between conversations and "New chat" resets.
  useEffect(() => {
    if (streaming) return; // never replace a thread that is actively streaming

    // New-chat landing, or "New chat" clicked from an open conversation.
    if (!conversationId) {
      if (pendingNewId.current) return; // mid new-chat turn: keep the live thread
      if (seededFor.current !== null) {
        seededFor.current = null;
        setMessages([]);
      }
      return;
    }

    // Already showing this conversation (including the one we just streamed and
    // swapped the URL for) — leave the live/seeded thread untouched.
    if (seededFor.current === conversationId) return;

    if (conv.data) {
      setMessages(messagesFromServer(conv.data));
      seededFor.current = conversationId;
    } else {
      // Switched to a conversation whose history hasn't loaded yet — drop the
      // previous thread so we don't show the wrong conversation.
      setMessages([]);
    }
  }, [conversationId, conv.data, streaming, setMessages]);

  // Auto-scroll to the latest message.
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages]);

  const handleSend = useCallback(
    async (text: string, references: MessageReference[] = []) => {
      const wasNew = !conversationId;
      await send(text, references);

      const id = conversationId ?? pendingNewId.current;
      if (!id) return;

      // The live stream already produced the full thread (text + rich tool
      // cards). Mark it as the displayed conversation so the URL swap below does
      // NOT trigger a reseed that could wipe it if the server read lags.
      seededFor.current = id;

      // Refresh the sidebar (title now set) and prime the detail cache for any
      // future reload — without applying it over the live thread.
      qc.invalidateQueries({ queryKey: conversationKeys.all });
      qc.invalidateQueries({ queryKey: conversationKeys.detail(id) });

      // New conversation: move to its permanent URL. Same route segment, so the
      // component stays mounted and the live thread remains on screen — no
      // remount, no flicker, no reload. The router stays in sync so "New chat"
      // and conversation switching keep working.
      if (wasNew) {
        router.replace(`/chat/${id}`, { scroll: false });
      }
    },
    [conversationId, send, qc, router],
  );

  // Consume anything handed over from another surface (a JobCard "Match CV", a
  // CV-detail action, a suggestion). A complete prompt auto-sends; a draft just
  // pre-fills the composer so the user can finish it (e.g. paste a posting).
  useEffect(() => {
    const pending = consumePendingPrompt();
    if (pending) {
      void handleSend(pending);
      return;
    }
    const d = consumePendingDraft();
    if (d) {
      setDraft(d);
      setComposerKey((k) => k + 1);
    }
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
        <ChatEmpty onPick={handleSend} onDraft={seedDraft} />
      ) : (
        <div ref={scrollRef} className="scroll-area flex-1 px-7 pb-2 pt-3">
          {messages.map((m) => (
            <MessageBubble key={m.id} message={m} />
          ))}
          <div className="h-3" />
        </div>
      )}
      <div className="px-7 pb-5 pt-2">
        <Composer
          key={composerKey}
          onSend={handleSend}
          onStop={stop}
          streaming={streaming}
          initialValue={draft}
          autoFocus={composerKey > 0}
        />
      </div>
    </div>
  );
}
