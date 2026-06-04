"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Link2, Plus } from "lucide-react";
import { jobsApi } from "@/lib/api/jobs";
import { useSaveJob } from "@/hooks/use-jobs";
import { ApiError } from "@/lib/api/client";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/states";

/** Paste a posting URL → analyze (SSRF-guarded) → save to the tracker. */
export function AnalyzeUrlBar() {
  const [url, setUrl] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const save = useSaveJob();

  const submit = async () => {
    const value = url.trim();
    if (!value || analyzing) return;
    setAnalyzing(true);
    try {
      const info = await jobsApi.analyzeUrl(value);
      await save.mutateAsync({
        title: info.title,
        company: info.company ?? undefined,
        location: info.location ?? undefined,
        description: info.description ?? undefined,
        apply_link: info.apply_link ?? value,
      });
      toast.success("Job added to tracker");
      setUrl("");
    } catch (err) {
      if (err instanceof ApiError && err.status === 400) {
        toast.error("That URL was rejected (blocked or unreachable)");
      } else {
        toast.error("Couldn't analyze that URL");
      }
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="panel mb-6 flex items-center gap-2 rounded-[var(--r-lg)] p-2 pl-3.5">
      <Link2 className="size-[18px] shrink-0 text-faint" />
      <input
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && submit()}
        placeholder="Paste a job posting URL to add it to your tracker…"
        className="min-w-0 flex-1 bg-transparent py-2 text-[13.5px] text-fg outline-none placeholder:text-faint"
      />
      <Button onClick={submit} disabled={!url.trim() || analyzing}>
        {analyzing ? <Spinner className="size-4" /> : <Plus className="size-4" />}
        Add
      </Button>
    </div>
  );
}
