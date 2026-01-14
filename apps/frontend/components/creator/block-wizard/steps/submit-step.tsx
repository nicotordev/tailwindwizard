import { cn } from "@/lib/utils";
import { CheckCircle2 } from "lucide-react";
import * as React from "react";
import { BlockDraft } from "../types";

interface SubmitStepProps {
  draft: BlockDraft;
}

export function SubmitStep({ draft }: SubmitStepProps) {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="rounded-[3rem] border border-border/40 bg-muted/10 p-10 overflow-hidden relative">
        <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
          <CheckCircle2 className="size-64" />
        </div>
        <p className="text-2xl font-heading tracking-tight mb-8">Final Manifestation</p>
        <div className="grid gap-4">
          {[
            { label: "Title", value: draft.title || "Untitled" },
            {
              label: "Identity",
              value: draft.slug || "-",
              mono: true,
            },
            {
              label: "Value",
              value: draft.price ? `${draft.currency} ${draft.price}` : "Free Transfer",
            },
            { label: "Exposure", value: draft.visibility },
          ].map((item, i) => (
            <div
              key={i}
              className="flex items-center justify-between p-5 rounded-2xl bg-background/40 border border-border/40"
            >
              <span className="text-sm font-bold text-muted-foreground uppercase tracking-widest">
                {item.label}
              </span>
              <span className={cn("font-bold text-foreground", item.mono && "font-mono text-sm opacity-80")}>
                {item.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
