import { ChatThread } from "@/components/chat/chat-thread";

/**
 * Single chat route for both the new-chat landing (`/chat`) and an existing
 * conversation (`/chat/:id`). Using one optional-catch-all segment keeps the
 * same <ChatThread> mounted across the new→existing transition, so the first
 * turn streams in place and the URL swap never discards the live thread.
 */
export default async function ChatPage({
  params,
}: {
  params: Promise<{ slug?: string[] }>;
}) {
  const { slug } = await params;
  const conversationId = slug?.[0] ?? null;
  return <ChatThread conversationId={conversationId} />;
}
