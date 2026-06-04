"use client";

import { Briefcase } from "lucide-react";
import { useSavedJobs } from "@/hooks/use-jobs";
import { JOB_STATUS_COLUMNS } from "@/lib/constants";
import { PageWrap, PageHeader } from "@/components/layout/page";
import { AnalyzeUrlBar } from "@/components/jobs/analyze-url-bar";
import { StatusColumn } from "@/components/jobs/status-column";
import { LoadingState, EmptyState } from "@/components/ui/states";

export default function JobTrackerPage() {
  const { data, isLoading, isError } = useSavedJobs();

  const jobs = data ?? [];

  return (
    <PageWrap max={1200}>
      <PageHeader
        title="Job tracker"
        description="Saved roles as a status board — move them from saved to applied to offer."
      />
      <AnalyzeUrlBar />

      {isLoading ? (
        <LoadingState label="Loading saved jobs…" />
      ) : isError ? (
        <EmptyState icon={Briefcase} title="Couldn't load saved jobs" />
      ) : jobs.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title="No saved jobs yet"
          description="Save jobs from chat search results, or paste a posting URL above."
        />
      ) : (
        <div className="scroll-area flex gap-4 overflow-x-auto pb-2">
          {JOB_STATUS_COLUMNS.map((col) => (
            <StatusColumn
              key={col.status}
              label={col.label}
              jobs={jobs.filter((j) => j.status === col.status)}
            />
          ))}
        </div>
      )}
    </PageWrap>
  );
}
