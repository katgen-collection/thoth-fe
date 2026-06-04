import { cn } from "@/lib/utils";

/** Scrollable, centered page container for the secondary surfaces. */
export function PageWrap({
  children,
  max = 880,
}: {
  children: React.ReactNode;
  max?: number;
}) {
  return (
    <div className="scroll-area flex-1 px-8 pb-16 pt-7">
      <div className="mx-auto" style={{ maxWidth: max }}>
        {children}
      </div>
    </div>
  );
}

export function PageHeader({
  title,
  description,
  action,
  className,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "mb-6 flex flex-wrap items-end justify-between gap-4",
        className,
      )}
    >
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">{title}</h1>
        {description && <p className="mt-1.5 text-sm text-muted">{description}</p>}
      </div>
      {action}
    </div>
  );
}

/** Uppercase section label used inside detail panels. */
export function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-[12.5px] font-extrabold uppercase tracking-[0.05em] text-muted">
      {children}
    </h3>
  );
}
