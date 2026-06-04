"use client";

import { FileText } from "lucide-react";
import { useCvs } from "@/hooks/use-cvs";
import { PageWrap, PageHeader } from "@/components/layout/page";
import { CvUploadDropzone } from "@/components/cv/cv-upload-dropzone";
import { CvCard } from "@/components/cv/cv-card";
import { LoadingState, EmptyState } from "@/components/ui/states";

export default function CvLibraryPage() {
  const { data, isLoading, isError } = useCvs();

  return (
    <PageWrap>
      <PageHeader
        title="CV library"
        description="Manage the CVs ThothAI uses to match and tailor."
      />
      <CvUploadDropzone />

      {isLoading ? (
        <LoadingState label="Loading CVs…" />
      ) : isError ? (
        <EmptyState
          icon={FileText}
          title="Couldn't load your CVs"
          description="Please try again in a moment."
        />
      ) : !data || data.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No CVs yet"
          description="Upload a PDF above to get started — ThothAI will parse it automatically."
        />
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {data.map((cv) => (
            <CvCard key={cv.id} cv={cv} />
          ))}
        </div>
      )}
    </PageWrap>
  );
}
