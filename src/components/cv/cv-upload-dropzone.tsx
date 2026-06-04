"use client";

import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";
import { Upload } from "lucide-react";
import { useUploadCv } from "@/hooks/use-cvs";
import { ApiError } from "@/lib/api/client";
import { Spinner } from "@/components/ui/states";
import { cn } from "@/lib/utils";

/** Drag-and-drop PDF upload. Maps backend rejections (413/422/403) to toasts. */
export function CvUploadDropzone() {
  const upload = useUploadCv();

  const onDrop = useCallback(
    (accepted: File[]) => {
      const file = accepted[0];
      if (!file) return;
      upload.mutate(file, {
        onSuccess: () => toast.success("CV uploaded — parsing started"),
        onError: (err) => {
          if (err instanceof ApiError) {
            if (err.status === 413) return toast.error("File too large");
            if (err.status === 422) return toast.error("That doesn't look like a valid PDF");
            if (err.status === 403) return toast.error("Upload limit reached");
          }
          toast.error("Upload failed");
        },
      });
    },
    [upload],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
    multiple: false,
    disabled: upload.isPending,
  });

  return (
    <div
      {...getRootProps()}
      className={cn(
        "panel mb-6 flex cursor-pointer flex-col items-center gap-2 rounded-[var(--r-lg)] border-[1.5px] border-dashed border-border-strong p-7 text-center transition-colors",
        isDragActive && "bg-glass-hover",
      )}
    >
      <input {...getInputProps()} />
      <div className="grid size-10 place-items-center rounded-[11px] bg-accent-soft text-accent">
        {upload.isPending ? <Spinner className="size-5" /> : <Upload className="size-5" />}
      </div>
      <div className="text-sm font-bold">
        {upload.isPending
          ? "Uploading…"
          : isDragActive
            ? "Drop the PDF to upload"
            : "Drop a PDF here, or click to browse"}
      </div>
      <div className="text-[12.5px] text-muted">
        ThothAI parses skills, experience &amp; education automatically · PDF only
      </div>
    </div>
  );
}
