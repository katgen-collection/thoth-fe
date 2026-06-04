"use client";

import { useState } from "react";
import { format, parseISO } from "date-fns";
import { Clock, Search, ChevronDown } from "lucide-react";
import { useSearchHistory, useSearchResults } from "@/hooks/use-search";
import type { SearchJob } from "@/types/api";
import { PageWrap, PageHeader } from "@/components/layout/page";
import { JobCard } from "@/components/jobs/job-card";
import { LoadingState, EmptyState, Spinner } from "@/components/ui/states";
import { cn } from "@/lib/utils";

function formatDate(iso: string): string {
  try {
    return format(parseISO(iso), "MMM d, yyyy · HH:mm");
  } catch {
    return iso;
  }
}

function SearchRow({ search }: { search: SearchJob }) {
  const [open, setOpen] = useState(false);
  // Prefer inline results; lazily fetch the full record if absent.
  const needFetch = open && (!search.result || search.result.length === 0);
  const { data, isLoading } = useSearchResults(needFetch ? search.id : null);
  const jobs = search.result?.length ? search.result : (data?.result ?? []);

  return (
    <div className="panel rounded-[var(--r-lg)]">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-3 p-4 text-left"
      >
        <div className="grid size-[38px] shrink-0 place-items-center rounded-[10px] bg-accent-soft text-fg">
          <Search className="size-[17px]" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate text-[15px] font-bold">{search.query}</div>
          <div className="mono mt-0.5 text-[11.5px] text-faint">
            {formatDate(search.created_at)}
          </div>
        </div>
        <ChevronDown
          className={cn("size-5 shrink-0 text-faint transition-transform", open && "rotate-180")}
        />
      </button>

      {open && (
        <div className="border-t border-border p-4">
          {isLoading ? (
            <div className="flex justify-center py-6 text-muted">
              <Spinner className="size-5" />
            </div>
          ) : jobs.length === 0 ? (
            <p className="py-4 text-center text-[13px] text-faint">
              No stored results for this search.
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-2.5 md:grid-cols-2">
              {jobs.map((job, i) => (
                <JobCard key={`${job.apply_link}-${i}`} job={job} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function SearchHistoryPage() {
  const { data, isLoading, isError } = useSearchHistory();

  return (
    <PageWrap max={920}>
      <PageHeader
        title="Search history"
        description="Every search ThothAI ran for you and the jobs it retrieved. Most search happens in chat."
      />
      {isLoading ? (
        <LoadingState label="Loading history…" />
      ) : isError ? (
        <EmptyState icon={Clock} title="Couldn't load search history" />
      ) : !data || data.items.length === 0 ? (
        <EmptyState
          icon={Clock}
          title="No searches yet"
          description="Ask ThothAI to find jobs in chat — your searches will show up here."
        />
      ) : (
        <div className="flex flex-col gap-2.5">
          {data.items.map((s) => (
            <SearchRow key={s.id} search={s} />
          ))}
        </div>
      )}
    </PageWrap>
  );
}
