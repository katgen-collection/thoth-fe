"use client";

import { useState } from "react";
import { Layers, ChevronDown, Check, Sparkles } from "lucide-react";
import { MODELS } from "@/lib/constants";
import { useUiStore } from "@/stores/ui-store";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { cn } from "@/lib/utils";

export function ModelSelector() {
  const model = useUiStore((s) => s.model);
  const setModel = useUiStore((s) => s.setModel);
  const [open, setOpen] = useState(false);
  const current = MODELS.find((m) => m.id === model) ?? MODELS[0];

  return (
    <div className="relative">
      <Button variant="outline" size="md" onClick={() => setOpen((o) => !o)}>
        <Layers className="size-[15px]" /> {current.name}
        <ChevronDown className="size-3.5 opacity-60" />
      </Button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="glass-strong absolute right-0 top-[calc(100%+6px)] z-50 w-[268px] rounded-[var(--r-md)] p-1.5 shadow-[var(--shadow-lg)]">
            {MODELS.map((m) => {
              const active = m.id === model;
              return (
                <button
                  key={m.id}
                  onClick={() => {
                    setModel(m.id);
                    setOpen(false);
                  }}
                  className={cn(
                    "flex w-full gap-2.5 rounded-[9px] px-3 py-2.5 text-left transition-colors",
                    active ? "bg-glass-hover" : "hover:bg-glass",
                  )}
                >
                  <span className="grid size-[30px] shrink-0 place-items-center rounded-lg bg-accent-soft text-fg">
                    <Sparkles className="size-[15px]" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-1.5 text-[13px] font-bold">
                      {m.name}
                      {m.badge === "Pro" && (
                        <Chip className="h-[18px] px-1.5 py-0 text-[10px]">Pro</Chip>
                      )}
                    </span>
                    <span className="mt-0.5 block text-[11.5px] text-muted">{m.sub}</span>
                  </span>
                  {active && <Check className="mt-1.5 size-4 shrink-0 text-fg" />}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
