"use client";

import Link from "next/link";
import { FileText, ChevronRight, Star, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { Cv } from "@/types/api";
import { Chip } from "@/components/ui/chip";
import { cn } from "@/lib/utils";
import { useSetDefaultCv, useDeleteCv } from "@/hooks/use-cvs";

const STATUS_LABEL: Record<Cv["status"], string> = {
  uploaded: "Queued",
  processing: "Parsing…",
  ready: "Ready",
  failed: "Failed",
};

const STATUS_DOT: Record<Cv["status"], string> = {
  uploaded: "bg-warning",
  processing: "bg-warning",
  ready: "bg-positive",
  failed: "bg-warning",
};

export function CvCard({ cv }: { cv: Cv }) {
  const setDefault = useSetDefaultCv();
  const del = useDeleteCv();

  const onSetDefault = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDefault.mutate(cv.id, {
      onSuccess: () => toast.success(`“${cv.parsed_data?.name ?? cv.filename}” is now your default CV`),
      onError: () => toast.error("Couldn't set default CV"),
    });
  };

  const onDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!window.confirm(`Delete “${cv.filename}”? This can't be undone.`)) return;
    del.mutate(cv.id, {
      onSuccess: () => toast.success("CV deleted"),
      onError: () => toast.error("Couldn't delete CV"),
    });
  };

  return (
    <Link
      href={`/cvs/${cv.id}`}
      className="panel lift group flex flex-col gap-3 rounded-[var(--r-lg)] p-4 hover:bg-glass-hover"
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
        <span className="flex items-center gap-1.5 text-muted">
          <span className={cn("size-1.5 rounded-full", STATUS_DOT[cv.status])} />
          {STATUS_LABEL[cv.status]}
        </span>

        <div className="flex items-center gap-1">
          {/* set default — hidden for the current default */}
          {!cv.is_default && (
            <button
              onClick={onSetDefault}
              disabled={setDefault.isPending}
              title="Set as default CV"
              aria-label="Set as default CV"
              className="flex items-center gap-1 rounded-[var(--r-sm)] px-2 py-1 text-[12px] font-semibold text-muted transition-colors hover:bg-glass-hover hover:text-fg disabled:opacity-60"
            >
              {setDefault.isPending ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <Star className="size-3.5" />
              )}
              Set default
            </button>
          )}
          <button
            onClick={onDelete}
            disabled={del.isPending}
            title="Delete CV"
            aria-label="Delete CV"
            className="grid size-7 place-items-center rounded-[var(--r-sm)] text-faint opacity-0 transition-all hover:bg-glass-hover hover:text-warning focus-visible:opacity-100 group-hover:opacity-100 disabled:opacity-60"
          >
            <Trash2 className="size-3.5" />
          </button>
          <span className="flex items-center gap-0.5 font-semibold text-accent">
            Open <ChevronRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
          </span>
        </div>
      </div>
    </Link>
  );
}
