import { GraduationCap } from "lucide-react";
import type { ParsedCv } from "@/types/api";
import { SectionLabel } from "@/components/layout/page";
import { Tag } from "@/components/ui/chip";

/** Renders parsed CV data: skills, experience, education. */
export function ParsedCvView({ data }: { data: ParsedCv }) {
  return (
    <div className="grid grid-cols-1 items-start gap-4 md:grid-cols-[1fr_1.6fr]">
      <div className="panel rounded-[var(--r-lg)] p-4">
        <SectionLabel>Skills</SectionLabel>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {data.skills?.length ? (
            data.skills.map((s) => (
              <Tag key={s} className="bg-accent-soft text-accent">
                {s}
              </Tag>
            ))
          ) : (
            <p className="text-[13px] text-faint">No parsed skills.</p>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <div className="panel rounded-[var(--r-lg)] p-4">
          <SectionLabel>Experience</SectionLabel>
          <div className="mt-3 flex flex-col gap-4">
            {data.experience?.length ? (
              data.experience.map((e, i) => (
                <div key={i} className="border-l-2 border-border-strong pl-4">
                  <div className="flex flex-wrap justify-between gap-2">
                    <span className="text-sm font-bold">
                      {[e.role, e.company].filter(Boolean).join(" · ")}
                    </span>
                    {e.period && (
                      <span className="mono text-[11.5px] text-faint">{e.period}</span>
                    )}
                  </div>
                  {e.bullets && e.bullets.length > 0 && (
                    <ul className="mt-2 list-disc pl-4 text-[13px] leading-relaxed text-muted">
                      {e.bullets.map((b, j) => (
                        <li key={j}>{b}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))
            ) : (
              <p className="text-[13px] text-faint">No parsed experience.</p>
            )}
          </div>
        </div>

        {data.education && data.education.length > 0 && (
          <div className="panel rounded-[var(--r-lg)] p-4">
            <SectionLabel>Education</SectionLabel>
            <div className="mt-3 flex flex-col gap-2">
              {data.education.map((ed, i) => (
                <div key={i} className="flex flex-wrap justify-between gap-2">
                  <span className="flex items-center gap-1.5 text-sm font-bold">
                    <GraduationCap className="size-4 text-accent" />
                    {[ed.degree, ed.school].filter(Boolean).join(" · ")}
                  </span>
                  {ed.period && (
                    <span className="mono text-[11.5px] text-faint">{ed.period}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
