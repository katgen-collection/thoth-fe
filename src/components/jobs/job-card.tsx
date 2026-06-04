"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Building2, MapPin, Bookmark, Check, ExternalLink, Target } from "lucide-react";
import type { JobResult } from "@/types/api";
import { useSaveJob } from "@/hooks/use-jobs";
import { useChatStore } from "@/stores/chat-store";
import { Button } from "@/components/ui/button";
import { initials } from "@/lib/utils";
import { RelevanceBadge } from "./relevance-badge";

/**
 * A single search-result job. Offers the interactive actions that make the chat
 * feel like a modern AI app: save to tracker (optimistic), apply, match CV.
 */
export function JobCard({ job }: { job: JobResult }) {
  const router = useRouter();
  const save = useSaveJob();
  const setPendingPrompt = useChatStore((s) => s.setPendingPrompt);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    if (saved) return;
    setSaved(true); // optimistic flip
    save.mutate(
      {
        title: job.title,
        company: job.company,
        location: job.location,
        description: job.description_snippet,
        apply_link: job.apply_link,
      },
      {
        onSuccess: () => toast.success("Saved to tracker"),
        onError: () => {
          setSaved(false);
          toast.error("Couldn't save job");
        },
      },
    );
  };

  const handleMatch = () => {
    setPendingPrompt(
      `Match my CV against this role: ${job.title} at ${job.company}.\n\n${job.description_snippet}`,
    );
    router.push("/chat");
  };

  return (
    <div className="flex flex-col gap-2.5 rounded-[var(--r-md)] border border-border bg-glass p-3.5 transition-colors hover:border-border-strong hover:bg-glass-hover">
      <div className="flex items-start gap-3">
        <div className="mono grid size-[42px] shrink-0 place-items-center rounded-[11px] border border-border bg-accent-soft text-sm font-bold text-fg">
          {initials(job.company)}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="text-[14.5px] font-bold leading-tight">{job.title}</div>
            <RelevanceBadge score={job.relevance_score} />
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12.5px] text-muted">
            <span className="inline-flex items-center gap-1 font-semibold text-fg">
              <Building2 className="size-3.5" /> {job.company}
            </span>
            <span className="inline-flex items-center gap-1">
              <MapPin className="size-3.5" /> {job.location}
            </span>
          </div>
        </div>
      </div>

      <p className="text-[13px] leading-relaxed text-muted">{job.description_snippet}</p>

      <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
        <Button
          variant={saved ? "outline" : "primary"}
          size="sm"
          onClick={handleSave}
          disabled={save.isPending}
        >
          {saved ? (
            <>
              <Check className="size-3.5" /> Saved
            </>
          ) : (
            <>
              <Bookmark className="size-3.5" /> Save
            </>
          )}
        </Button>
        <a href={job.apply_link} target="_blank" rel="noopener noreferrer">
          <Button variant="outline" size="sm">
            <ExternalLink className="size-3.5" /> Apply
          </Button>
        </a>
        <Button variant="ghost" size="sm" onClick={handleMatch}>
          <Target className="size-3.5" /> Match CV
        </Button>
      </div>
    </div>
  );
}
