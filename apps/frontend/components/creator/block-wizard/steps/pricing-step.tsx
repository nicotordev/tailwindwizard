import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sparkles } from "lucide-react";
import * as React from "react";
import { FiShield } from "react-icons/fi";
import { BlockDraft } from "../types";

interface PricingStepProps {
  draft: BlockDraft;
  setField: <K extends keyof BlockDraft>(key: K, value: BlockDraft[K]) => void;
}

export function PricingStep({ draft, setField }: PricingStepProps) {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="space-y-3">
          <label className="text-sm font-bold tracking-tight text-foreground/80">Price</label>
          <div className="relative group">
            <Input
              type="number"
              min="0"
              step="0.01"
              value={draft.price}
              onChange={(event) => setField("price", event.target.value)}
              placeholder="0.00"
              className="h-14 rounded-2xl bg-background/40 border-border/60 focus:bg-background/80 transition-all text-xl font-heading px-5"
            />
          </div>
        </div>
        <div className="space-y-3">
          <label className="text-sm font-bold tracking-tight text-foreground/80">Currency</label>
          <Select
            value={draft.currency}
            onValueChange={(value) => setField("currency", value as BlockDraft["currency"])}
          >
            <SelectTrigger className="h-14 rounded-2xl bg-background/40 border-border/60 focus:bg-background/80 transition-all text-base px-5">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="rounded-2xl">
              {["USD", "EUR", "CLP", "GBP", "MXN", "ARS", "BRL"].map((c) => (
                <SelectItem key={c} value={c} className="rounded-xl my-1 mx-1">
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-3">
          <label className="text-sm font-bold tracking-tight text-foreground/80">License Tier</label>
          <Select
            value={draft.license}
            onValueChange={(value) => setField("license", value as BlockDraft["license"])}
          >
            <SelectTrigger className="h-14 rounded-2xl bg-background/40 border-border/60 focus:bg-background/80 transition-all text-base px-5">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="rounded-2xl">
              {["PERSONAL", "TEAM", "ENTERPRISE"].map((l) => (
                <SelectItem key={l} value={l} className="rounded-xl my-1 mx-1">
                  <div className="flex items-center gap-3">
                    <FiShield className="size-4 text-primary" />
                    {l.charAt(0) + l.slice(1).toLowerCase()}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="rounded-3xl border border-dashed border-primary/20 bg-primary/5 p-8 flex items-start gap-5">
        <div className="h-10 w-10 shrink-0 rounded-full bg-primary/10 flex items-center justify-center text-primary">
          <Sparkles className="size-5" />
        </div>
        <div className="space-y-1.5">
          <div className="text-sm font-bold text-primary">Creator Note</div>
          <p className="text-sm font-medium text-muted-foreground leading-relaxed">
            The final license configuration will be verified during review. Ensure your pricing
            reflects the value of the components and their intended audience.
          </p>
        </div>
      </div>
    </div>
  );
}
