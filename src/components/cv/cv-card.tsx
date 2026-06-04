import Link from "next/link";
import { FileText, ChevronRight } from "lucide-react";
import type { Cv } from "@/types/api";
import { Chip } from "@/components/ui/chip";

const STATUS_LABEL: Record<Cv["status"], string> = {
  uploaded: "Queued",
  processing: "Parsing…",
  ready: "Ready",
  failed: "Failed",
};

export function CvCard({ cv }: { cv: Cv }) {
  return (
    <Link
      href={`/cvs/${cv.id}`}
      className="panel flex flex-col gap-3 rounded-[var(--r-lg)] p-4 transition-all hover:-translate-y-0.5 hover:bg-glass-hover"
    >
      <div className="flex items-start gap-3">
        <div className="grid h-[54px] w-11 shrink-0 place-items-center rounded-lg border border-border bg-code-bg text-accent">
          <FileText className="size-[22px]" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span className="truncate text-sm font-bold">
              {cv.parsed_data?.name ?? cv.filename}
            </span>
            {cv.is_default && <Chip accent className="h-5 px-1.5 text-[10.5px]">Default</Chip>}
          </div>
          <div className="mono mt-0.5 truncate text-[11.5px] text-faint">{cv.filename}</div>
        </div>
      </div>
      <div className="flex items-center justify-between border-t border-border pt-3 text-[12.5px]">
        <span className="text-muted">{STATUS_LABEL[cv.status]}</span>
        <span className="flex items-center gap-0.5 font-semibold text-accent">
          Open <ChevronRight className="size-3.5" />
        </span>
      </div>
    </Link>
  );
}
