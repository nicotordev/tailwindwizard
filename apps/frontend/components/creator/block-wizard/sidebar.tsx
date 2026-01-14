import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { CheckCircle2 } from "lucide-react";
import * as React from "react";
import { steps } from "./types";

interface SidebarProps {
  activeStep: number;
  maxStepReached: number;
  isDevMode: boolean;
  progressValue: number;
  goToStep: (index: number) => Promise<void>;
  isStepLocked: (index: number) => boolean;
}

export function Sidebar({
  activeStep,
  maxStepReached,
  isDevMode,
  progressValue,
  goToStep,
  isStepLocked,
}: SidebarProps) {
  return (
    <Card className="bg-card/30 backdrop-blur-2xl border-border/40 rounded-[2.5rem] h-fit sticky top-8 shadow-2xl shadow-primary/5">
      <CardHeader className="space-y-6 p-8 pb-4">
        <div className="space-y-3">
          <Badge
            variant="secondary"
            className={cn(
              "w-fit border-none transition-colors",
              isDevMode
                ? "bg-amber-500/10 text-amber-500 hover:bg-amber-500/20"
                : "bg-primary/10 text-primary hover:bg-primary/20"
            )}
          >
            {isDevMode ? "Developer Suite" : "Creation Suite"}
          </Badge>
          <CardTitle className="text-3xl font-heading tracking-tight">
            {isDevMode ? "Direct Manifest" : "Forge Sequence"}
          </CardTitle>
          <CardDescription className="text-sm leading-relaxed">
            {isDevMode
              ? "Manipulate the raw essence of your block directly via JSON."
              : "Step through the ritual to publish your next digital spell."}
          </CardDescription>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-[10px] uppercase tracking-widest font-bold text-muted-foreground/70">
            <span>Completion</span>
            <span>{Math.round(progressValue)}%</span>
          </div>
          <Progress value={progressValue} className="h-1.5 bg-primary/5" />
        </div>
      </CardHeader>
      <CardContent className="space-y-3 p-6">
        {steps.map((item, index) => {
          const Icon = item.icon;
          const isActive = index === activeStep;
          const isCompleted = index < activeStep;
          const isLocked = isStepLocked(index);

          return (
            <button
              key={item.id}
              type="button"
              disabled={isLocked}
              onClick={() => void goToStep(index)}
              className={cn(
                "w-full text-left rounded-[1.25rem] px-4 py-4 transition-all duration-300 group",
                isActive
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-[1.02]"
                  : isLocked
                  ? "opacity-40 cursor-not-allowed filter grayscale"
                  : "hover:bg-muted/40 text-muted-foreground"
              )}
            >
              <div className="flex items-center gap-4">
                <div
                  className={cn(
                    "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors",
                    isActive
                      ? "bg-white/20 text-white"
                      : isCompleted
                      ? "bg-primary/10 text-primary"
                      : "bg-muted/50 text-muted-foreground group-hover:bg-muted"
                  )}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="size-5" />
                  ) : (
                    <Icon className="size-5" />
                  )}
                </div>
                <div className="min-w-0">
                  <p
                    className={cn(
                      "text-sm font-bold tracking-tight leading-none",
                      isActive ? "text-white" : "text-foreground"
                    )}
                  >
                    {item.title}
                  </p>
                  <p
                    className={cn(
                      "text-[11px] mt-1.5 truncate opacity-70",
                      isActive ? "text-white/80" : "text-muted-foreground"
                    )}
                  >
                    {isLocked ? "Complete previous steps" : item.description}
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </CardContent>
    </Card>
  );
}
