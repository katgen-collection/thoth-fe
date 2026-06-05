import { create } from "zustand";

/**
 * Light chat-side global state.
 *
 * `pendingPrompt` lets a surface *outside* the chat (a JobCard's "Match my CV",
 * a CV-detail action, an empty-state suggestion) hand a *complete* message to the
 * chat: set it, navigate to `/chat`, and the new-chat view consumes + auto-sends.
 *
 * `pendingDraft` is for prompts the user still has to finish (e.g. "Match my CV
 * against this job posting:" — they must paste the posting). It pre-fills the
 * composer and focuses it instead of auto-sending, so the chat never opens with
 * a half-written message already fired off.
 */
interface ChatState {
  pendingPrompt: string | null;
  setPendingPrompt: (prompt: string | null) => void;
  consumePendingPrompt: () => string | null;

  pendingDraft: string | null;
  setPendingDraft: (draft: string | null) => void;
  consumePendingDraft: () => string | null;
}

export const useChatStore = create<ChatState>((set, get) => ({
  pendingPrompt: null,
  setPendingPrompt: (pendingPrompt) => set({ pendingPrompt }),
  consumePendingPrompt: () => {
    const p = get().pendingPrompt;
    if (p !== null) set({ pendingPrompt: null });
    return p;
  },

  pendingDraft: null,
  setPendingDraft: (pendingDraft) => set({ pendingDraft }),
  consumePendingDraft: () => {
    const d = get().pendingDraft;
    if (d !== null) set({ pendingDraft: null });
    return d;
  },
}));
