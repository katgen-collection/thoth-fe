import { create } from "zustand";

/**
 * Light chat-side global state.
 *
 * `pendingPrompt` lets a surface *outside* the chat (a JobCard's "Match my CV",
 * a CV-detail action, an empty-state suggestion) hand a message to the chat:
 * set it, navigate to `/chat`, and the new-chat view consumes + auto-sends it.
 */
interface ChatState {
  pendingPrompt: string | null;
  setPendingPrompt: (prompt: string | null) => void;
  consumePendingPrompt: () => string | null;
}

export const useChatStore = create<ChatState>((set, get) => ({
  pendingPrompt: null,
  setPendingPrompt: (pendingPrompt) => set({ pendingPrompt }),
  consumePendingPrompt: () => {
    const p = get().pendingPrompt;
    if (p !== null) set({ pendingPrompt: null });
    return p;
  },
}));
