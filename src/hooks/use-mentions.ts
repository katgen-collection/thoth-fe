"use client";

import { useMemo } from "react";
import { useCvs } from "./use-cvs";
import { useSavedJobs } from "./use-jobs";

/** A workspace item the user can @-mention in the composer. */
export interface Mentionable {
  type: "cv" | "job";
  id: string;
  /** Primary text, also the literal inserted after `@`. */
  label: string;
  /** Secondary hint shown in the menu (company / "CV"). */
  sublabel?: string;
}

/** Strip a trailing .pdf so the inserted token reads cleanly. */
function cvLabel(filename: string): string {
  return filename.replace(/\.pdf$/i, "").trim() || filename;
}

/**
 * The flat list of things a user can @-mention: their CVs and saved jobs.
 * Reuses the existing react-query caches, so the menu opens instantly once the
 * CV library / tracker have been visited (and lazily fetches otherwise).
 */
export function useMentionables(): { items: Mentionable[]; loading: boolean } {
  const cvs = useCvs();
  const jobs = useSavedJobs();

  const items = useMemo<Mentionable[]>(() => {
    const out: Mentionable[] = [];
    for (const c of cvs.data ?? []) {
      out.push({ type: "cv", id: c.id, label: cvLabel(c.filename), sublabel: "CV" });
    }
    for (const j of jobs.data ?? []) {
      out.push({
        type: "job",
        id: j.id,
        label: j.title,
        sublabel: j.company ?? j.location ?? "Saved job",
      });
    }
    return out;
  }, [cvs.data, jobs.data]);

  return { items, loading: cvs.isLoading || jobs.isLoading };
}
