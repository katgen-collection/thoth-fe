import { ChatThread } from "@/components/chat/chat-thread";

export default async function ChatThreadPage({
  params,
}: {
  params: Promise<{ conversationId: string }>;
}) {
  const { conversationId } = await params;
  return <ChatThread key={conversationId} conversationId={conversationId} />;
}
