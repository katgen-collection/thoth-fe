import { ChatThread } from "@/components/chat/chat-thread";

/** New-chat landing. The first message lazily creates a conversation. */
export default function NewChatPage() {
  return <ChatThread conversationId={null} />;
}
