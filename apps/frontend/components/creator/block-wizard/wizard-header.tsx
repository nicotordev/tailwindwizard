import { Badge } from "@/components/ui/badge";
import { CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Terminal } from "lucide-react";
import * as React from "react";
import { steps } from "./types";

interface WizardHeaderProps {
  activeStep: number;
  isDevMode: boolean;
  setIsDevMode: (value: boolean) => void;
}

export function WizardHeader({
  activeStep,
  isDevMode,
  setIsDevMode,
}: WizardHeaderProps) {
  const step = steps[activeStep];
  const StepIcon = step.icon;

  return (
    <CardHeader className="p-10 pb-8 border-b border-border/40 bg-gradient-to-br from-primary/5 via-transparent to-transparent">
      <div className="flex flex-wrap items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="flex h-16 w-16 items-center justify-center rounded-[1.5rem] bg-background border border-border/60 text-primary shadow-inner shadow-primary/5">
            <StepIcon className="size-7" />
          </div>
          <div className="space-y-1.5">
            <CardTitle className="text-3xl font-heading tracking-tight">
              {step.title}
            </CardTitle>
            <CardDescription className="text-base">
              {step.description}
            </CardDescription>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3 px-4 py-2 rounded-2xl bg-primary/5 border border-primary/10">
            <div className="flex items-center gap-2">
              <Terminal className="size-4 text-primary" />
              <Label
                htmlFor="dev-mode"
                className="text-xs font-bold uppercase tracking-wider cursor-pointer"
              >
                Dev Mode
              </Label>
            </div>
            <Switch
              id="dev-mode"
              checked={isDevMode}
              onCheckedChange={setIsDevMode}
            />
          </div>

          <Badge
            variant="outline"
            className="rounded-full px-5 py-2 border-border/60 bg-background/50 text-xs font-bold tracking-wider uppercase"
          >
            Phase {activeStep + 1} <span className="mx-2 opacity-30">/</span>{" "}
            {steps.length}
          </Badge>
        </div>
      </div>
    </CardHeader>
  );
}
