"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Building2, MapPin, ExternalLink, Trash2, Lightbulb } from "lucide-react";
import type { SavedJob, SavedJobStatus } from "@/types/api";
import { useUpdateJobStatus, useDeleteSavedJob } from "@/hooks/use-jobs";
import { useChatStore } from "@/stores/chat-store";
import { SAVED_JOB_STATUSES } from "@/lib/constants";

export function SavedJobCard({ job }: { job: SavedJob }) {
  const router = useRouter();
  const updateStatus = useUpdateJobStatus();
  const remove = useDeleteSavedJob();
  const setPendingPrompt = useChatStore((s) => s.setPendingPrompt);

  const prepInterview = () => {
    setPendingPrompt(
      `Prep me for an interview for ${job.title}${job.company ? ` at ${job.company}` : ""}.`,
    );
    router.push("/chat");
  };

  return (
    <div className="flex flex-col gap-2 rounded-[var(--r-md)] border border-border bg-glass p-3 transition-colors hover:bg-glass-hover">
      <div className="text-[13.5px] font-bold leading-tight">{job.title}</div>
      <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[12px] text-muted">
        {job.company && (
          <span className="inline-flex items-center gap-1 font-semibold text-fg">
            <Building2 className="size-3" /> {job.company}
          </span>
        )}
        {job.location && (
          <span className="inline-flex items-center gap-1">
            <MapPin className="size-3" /> {job.location}
          </span>
        )}
      </div>

      <select
        value={job.status}
        onChange={(e) =>
          updateStatus.mutate({ id: job.id, status: e.target.value as SavedJobStatus })
        }
        className="mono mt-0.5 w-full rounded-[var(--r-sm)] border border-border bg-code-bg px-2 py-1 text-[11.5px] font-semibold text-fg outline-none"
        aria-label="Status"
      >
        {SAVED_JOB_STATUSES.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>

      <div className="flex items-center gap-1 pt-0.5 text-faint">
        {job.apply_link && (
          <a
            href={job.apply_link}
            target="_blank"
            rel="noopener noreferrer"
            className="grid size-7 place-items-center rounded-md hover:bg-glass-hover hover:text-fg"
            title="Apply"
          >
            <ExternalLink className="size-3.5" />
          </a>
        )}
        <button
          onClick={prepInterview}
          className="grid size-7 place-items-center rounded-md hover:bg-glass-hover hover:text-fg"
          title="Prep interview"
        >
          <Lightbulb className="size-3.5" />
        </button>
        <button
          onClick={() =>
            remove.mutate(job.id, { onSuccess: () => toast.success("Removed from tracker") })
          }
          className="ml-auto grid size-7 place-items-center rounded-md hover:bg-glass-hover hover:text-fg"
          title="Delete"
        >
          <Trash2 className="size-3.5" />
        </button>
      </div>
    </div>
  );
}
