import { Button } from "@/components/ui/button";
import * as React from "react";
import { WizardStep, steps } from "./types";

interface WizardNavigationProps {
  activeStep: number;
  setActiveStep: React.Dispatch<React.SetStateAction<number>>;
  canContinue: boolean;
  isDraftCreating: boolean;
  isSubmitting: boolean;
  goToStep: (index: number) => Promise<void>;
  handleSubmit: () => Promise<void>;
}

export function WizardNavigation({
  activeStep,
  setActiveStep,
  canContinue,
  isDraftCreating,
  isSubmitting,
  goToStep,
  handleSubmit,
}: WizardNavigationProps) {
  const step = steps[activeStep];

  return (
    <div className="flex flex-wrap items-center justify-between gap-6 border-t border-border/40 mt-12 pt-10">
      <Button
        variant="ghost"
        size="lg"
        className="rounded-2xl h-14 px-8 font-bold text-muted-foreground hover:bg-muted/50"
        onClick={() => setActiveStep((prev) => Math.max(0, prev - 1))}
        disabled={activeStep === 0}
      >
        Retreat
      </Button>
      <div className="flex items-center gap-4">
        {step.id !== "submit" ? (
          <Button
            size="lg"
            className="rounded-2xl h-14 px-10 font-bold text-base shadow-xl shadow-primary/20 group"
            onClick={() => void goToStep(Math.min(steps.length - 1, activeStep + 1))}
            disabled={!canContinue || isDraftCreating}
          >
            Proceed Sequence
          </Button>
        ) : (
          <Button
            size="lg"
            className="rounded-2xl h-14 px-10 font-bold text-base shadow-xl shadow-primary/20"
            onClick={handleSubmit}
            disabled={isSubmitting || !canContinue}
          >
            {isSubmitting ? "Casting..." : "Finalize Forge"}
          </Button>
        )}
      </div>
    </div>
  );
}
