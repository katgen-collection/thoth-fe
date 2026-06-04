import type { SavedJobStatus } from "@/types/api";

/** Model options surfaced in the chat top bar (display only for now). */
export const MODELS = [
  {
    id: "flash",
    name: "DeepSeek V4 Flash",
    sub: "Fast · everyday job search",
    badge: "Default",
  },
  {
    id: "pro",
    name: "DeepSeek V4 Pro",
    sub: "Deeper reasoning · CV analysis",
    badge: "Pro",
  },
] as const;

/** Empty-state prompt suggestions on a new chat. */
export const CHAT_SUGGESTIONS = [
  {
    icon: "Search",
    title: "Find backend roles",
    sub: "Senior Go positions in Jakarta",
    prompt: "Find me senior backend (Go) roles in Jakarta",
  },
  {
    icon: "Target",
    title: "Match my CV to a job",
    sub: "Score fit against a posting",
    prompt: "Match my CV against this job posting:",
  },
  {
    icon: "FileText",
    title: "Draft a cover letter",
    sub: "Tailored to a specific role",
    prompt: "Draft a cover letter tailored to this role:",
  },
  {
    icon: "Lightbulb",
    title: "Prep for an interview",
    sub: "System design & Go internals",
    prompt: "Help me prep for a backend system-design interview",
  },
] as const;

/** Saved-job tracker columns, in board order. */
export const JOB_STATUS_COLUMNS: { status: SavedJobStatus; label: string }[] = [
  { status: "saved", label: "Saved" },
  { status: "applied", label: "Applied" },
  { status: "interview", label: "Interview" },
  { status: "offer", label: "Offer" },
  { status: "rejected", label: "Rejected" },
];

export const SAVED_JOB_STATUSES: SavedJobStatus[] = [
  "saved",
  "applied",
  "interview",
  "offer",
  "rejected",
];
