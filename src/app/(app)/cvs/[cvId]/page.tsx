"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ChevronLeft,
  Download,
  Target,
  FileText,
  Wand2,
  Lightbulb,
  type LucideIcon,
} from "lucide-react";
import { useCv, useSetDefaultCv } from "@/hooks/use-cvs";
import { cvsApi } from "@/lib/api/cvs";
import { useChatStore } from "@/stores/chat-store";
import { PageWrap } from "@/components/layout/page";
import { ParsedCvView } from "@/components/cv/parsed-cv-view";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { LoadingState, EmptyState } from "@/components/ui/states";

export default function CvDetailPage({
  params,
}: {
  params: Promise<{ cvId: string }>;
}) {
  const { cvId } = use(params);
  const router = useRouter();
  const { data: cv, isLoading, isError, refetch } = useCv(cvId);
  const setDefault = useSetDefaultCv();
  const setPendingPrompt = useChatStore((s) => s.setPendingPrompt);

  if (isLoading) return <PageWrap><LoadingState label="Loading CV…" /></PageWrap>;
  if (isError || !cv) {
    return (
      <PageWrap>
        <EmptyState icon={FileText} title="CV not found" />
      </PageWrap>
    );
  }

  const askInChat = (prompt: string) => {
    setPendingPrompt(prompt);
    router.push("/chat");
  };

  const actions: { icon: LucideIcon; label: string; desc: string; onClick: () => void }[] = [
    {
      icon: Target,
      label: "Match to a job",
      desc: "Score fit vs. a posting",
      onClick: () => askInChat("Match my CV against this job posting:\n\n"),
    },
    {
      icon: FileText,
      label: "Cover letter",
      desc: "Generate & tailor",
      onClick: () => askInChat("Write a cover letter for this role using my CV:\n\n"),
    },
    {
      icon: Wand2,
      label: "Suggest edits",
      desc: "Improve weak bullets",
      onClick: () => askInChat("Suggest edits to tailor my CV for this role:\n\n"),
    },
    {
      icon: Lightbulb,
      label: "Analyze",
      desc: "Re-parse strengths & gaps",
      onClick: async () => {
        try {
          await cvsApi.analyze(cv.id);
          await refetch();
          toast.success("CV re-analyzed");
        } catch {
          toast.error("Analysis failed");
        }
      },
    },
  ];

  return (
    <PageWrap max={920}>
      <Button variant="ghost" className="mb-4 pl-2" onClick={() => router.push("/cvs")}>
        <ChevronLeft className="size-4" /> CV library
      </Button>

      {/* header */}
      <div className="panel mb-4 flex flex-wrap items-center gap-4 rounded-[var(--r-lg)] p-5">
        <div className="grid h-[68px] w-14 shrink-0 place-items-center rounded-[10px] border border-border bg-code-bg text-accent">
          <FileText className="size-7" />
        </div>
        <div className="min-w-[200px] flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold">
              {cv.parsed_data?.name ?? cv.filename}
            </h1>
            {cv.is_default && <Chip accent>Default CV</Chip>}
          </div>
          <div className="mono mt-1 text-[12px] text-faint">{cv.filename}</div>
        </div>
        <div className="flex gap-2">
          <a href={cvsApi.downloadUrl(cv.id)} target="_blank" rel="noopener noreferrer">
            <Button variant="outline">
              <Download className="size-[15px]" /> Download
            </Button>
          </a>
          {!cv.is_default && (
            <Button
              variant="outline"
              disabled={setDefault.isPending}
              onClick={() =>
                setDefault.mutate(cv.id, {
                  onSuccess: () => {
                    refetch();
                    toast.success("Set as default CV");
                  },
                })
              }
            >
              Set default
            </Button>
          )}
        </div>
      </div>

      {/* action grid */}
      <div className="mb-6 grid grid-cols-2 gap-2.5 md:grid-cols-4">
        {actions.map((a) => {
          const Icon = a.icon;
          return (
            <button
              key={a.label}
              onClick={a.onClick}
              className="panel flex flex-col gap-2 rounded-[var(--r-md)] p-3.5 text-left transition-all hover:-translate-y-0.5 hover:bg-glass-hover"
            >
              <span className="grid size-8 place-items-center rounded-[9px] bg-accent-soft text-accent">
                <Icon className="size-[17px]" />
              </span>
              <span className="text-[13px] font-bold">{a.label}</span>
              <span className="text-[11.5px] text-muted">{a.desc}</span>
            </button>
          );
        })}
      </div>

      {cv.parsed_data ? (
        <ParsedCvView data={cv.parsed_data} />
      ) : (
        <EmptyState
          icon={Lightbulb}
          title={cv.status === "ready" ? "No parsed data" : "Still parsing…"}
          description={
            cv.status === "ready"
              ? "Run Analyze to extract structured data."
              : "Thothai is extracting skills, experience, and education."
          }
        />
      )}
    </PageWrap>
  );
}
