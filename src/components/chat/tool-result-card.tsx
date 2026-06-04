"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  Briefcase,
  Target,
  Check,
  X,
  FileText,
  Copy,
  Lightbulb,
  Link2,
} from "lucide-react";
import type { ParsedToolResult } from "@/types/chat";
import { JobCard } from "@/components/jobs/job-card";
import { Button } from "@/components/ui/button";
import { Markdown } from "./markdown";

/** Circular score gauge (0–100). */
function ScoreGauge({ score }: { score: number }) {
  const R = 30;
  const C = 2 * Math.PI * R;
  return (
    <div className="relative size-[84px] shrink-0">
      <svg width="84" height="84" viewBox="0 0 84 84" className="-rotate-90">
        <circle cx="42" cy="42" r={R} fill="none" stroke="var(--border)" strokeWidth="7" />
        <circle
          cx="42"
          cy="42"
          r={R}
          fill="none"
          stroke="var(--accent)"
          strokeWidth="7"
          strokeLinecap="round"
          strokeDasharray={C}
          strokeDashoffset={C * (1 - score / 100)}
          className="transition-[stroke-dashoffset] duration-1000"
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center">
        <span className="mono text-[22px] font-bold">{score}</span>
      </div>
    </div>
  );
}

function CardShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="panel my-2 flex flex-col gap-3.5 rounded-[var(--r-lg)] p-4">{children}</div>
  );
}

function CardHeader({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 text-[13px] font-bold">
      <span className="text-accent">{icon}</span>
      {children}
    </div>
  );
}

export function ToolResultCard({ result }: { result: ParsedToolResult }) {
  switch (result.kind) {
    case "jobs":
      return (
        <CardShell>
          <div className="flex items-center justify-between px-0.5">
            <CardHeader icon={<Briefcase className="size-4" />}>
              {result.jobs.length} matching roles
            </CardHeader>
            <span className="text-[11.5px] text-faint">ranked by relevance</span>
          </div>
          <div className="flex flex-col gap-2">
            {result.jobs.map((job, i) => (
              <JobCard key={`${job.apply_link}-${i}`} job={job} />
            ))}
          </div>
        </CardShell>
      );

    case "saved_jobs":
      return (
        <CardShell>
          <CardHeader icon={<Briefcase className="size-4" />}>
            {result.jobs.length} saved {result.jobs.length === 1 ? "job" : "jobs"}
          </CardHeader>
          <div className="flex flex-col gap-1.5">
            {result.jobs.map((j) => (
              <div
                key={j.id}
                className="flex items-center justify-between rounded-[var(--r-sm)] border border-border bg-glass px-3 py-2 text-[13px]"
              >
                <span className="font-semibold">{j.title}</span>
                <span className="text-muted">{j.company}</span>
              </div>
            ))}
          </div>
        </CardShell>
      );

    case "match": {
      const { match } = result;
      return (
        <CardShell>
          <CardHeader icon={<Target className="size-4" />}>CV match</CardHeader>
          <div className="flex items-center gap-4">
            <ScoreGauge score={match.score} />
            <div className="grid flex-1 grid-cols-2 gap-3">
              <div>
                <div className="mb-1 flex items-center gap-1.5 text-[11.5px] font-bold text-positive">
                  <Check className="size-3" /> STRENGTHS
                </div>
                {match.strengths.map((s, i) => (
                  <div key={i} className="py-px text-[12.5px] text-muted">
                    {s}
                  </div>
                ))}
              </div>
              <div>
                <div className="mb-1 flex items-center gap-1.5 text-[11.5px] font-bold text-warning">
                  <X className="size-3" /> GAPS
                </div>
                {match.gaps.map((s, i) => (
                  <div key={i} className="py-px text-[12.5px] text-muted">
                    {s}
                  </div>
                ))}
              </div>
            </div>
          </div>
          {match.summary && <p className="text-[13px] text-muted">{match.summary}</p>}
        </CardShell>
      );
    }

    case "cover_letter":
      return <CopyableText icon={<FileText className="size-4" />} title="Cover letter" text={result.text} />;

    case "interview_prep":
      return (
        <CardShell>
          <CardHeader icon={<Lightbulb className="size-4" />}>Interview prep</CardHeader>
          <Markdown>{result.text}</Markdown>
        </CardShell>
      );

    case "suggest_edits":
      return (
        <CardShell>
          <CardHeader icon={<FileText className="size-4" />}>Suggested edits</CardHeader>
          {result.data.summary && (
            <p className="text-[13px] text-muted">{result.data.summary}</p>
          )}
          <div className="flex flex-col gap-2">
            {result.data.edits.map((e, i) => (
              <div key={i} className="rounded-[var(--r-md)] border border-border bg-glass p-3">
                <div className="text-[11.5px] font-bold uppercase tracking-wide text-faint">
                  {e.section}
                </div>
                <div className="mt-1.5 text-[13px] text-muted line-through">{e.current}</div>
                <div className="mt-1 text-[13px] font-medium text-fg">{e.suggested}</div>
                <div className="mt-1 text-[12px] text-faint">{e.reason}</div>
              </div>
            ))}
          </div>
        </CardShell>
      );

    case "analyze_url":
      return (
        <CardShell>
          <CardHeader icon={<Link2 className="size-4" />}>{result.data.title}</CardHeader>
          <div className="flex flex-wrap gap-x-3 gap-y-1 text-[12.5px] text-muted">
            {result.data.company && <span className="font-semibold text-fg">{result.data.company}</span>}
            {result.data.location && <span>{result.data.location}</span>}
          </div>
          {result.data.summary && <p className="text-[13px] text-muted">{result.data.summary}</p>}
        </CardShell>
      );

    case "text":
      return (
        <CardShell>
          <Markdown>{result.text}</Markdown>
        </CardShell>
      );

    default:
      return null;
  }
}

function CopyableText({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success("Copied to clipboard");
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error("Couldn't copy");
    }
  };
  return (
    <CardShell>
      <div className="flex items-center justify-between">
        <CardHeader icon={icon}>{title}</CardHeader>
        <Button variant="ghost" size="sm" onClick={copy}>
          {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
          {copied ? "Copied" : "Copy"}
        </Button>
      </div>
      <div className="whitespace-pre-wrap rounded-[var(--r-md)] border border-border bg-glass p-3.5 text-[13.5px] leading-relaxed text-fg">
        {text}
      </div>
    </CardShell>
  );
}
