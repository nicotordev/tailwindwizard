"use client";

import { useFormContext } from "react-hook-form";
import { Wand2, Hammer, ArrowRight, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { cn } from "@/lib/utils";
import { OnboardingFormData } from "../types";

interface RoleStepProps {
  onNext: () => void;
  isLoading: boolean;
}

export function RoleStep({ onNext, isLoading }: RoleStepProps) {
  const { control } = useFormContext<OnboardingFormData>();

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <FormField
        control={control}
        name="role"
        render={({ field }) => (
          <FormItem className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div
                onClick={() => field.onChange("CREATOR")}
                className={cn(
                  "group relative p-6 rounded-[2rem] border bg-card/40 backdrop-blur-xl transition-all cursor-pointer text-left h-full flex flex-col justify-between",
                  field.value === "CREATOR"
                    ? "border-creator ring-2 ring-creator/20 shadow-xl shadow-creator/10"
                    : "border-border/60 hover:border-creator/50"
                )}
              >
                <div>
                  <div
                    className={cn(
                      "h-12 w-12 rounded-2xl flex items-center justify-center mb-6 border transition-all duration-300",
                      field.value === "CREATOR"
                        ? "bg-creator border-creator/20"
                        : "bg-creator/5 border-creator/5 group-hover:bg-creator/10"
                    )}
                  >
                    <Wand2
                      className={cn(
                        "h-6 w-6 transition-colors",
                        field.value === "CREATOR"
                          ? "text-white"
                          : "text-creator"
                      )}
                    />
                  </div>
                  <h3 className="text-xl font-bold font-heading mb-2">
                    I&apos;m a Creator
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Upload your blocks, earn revenue, and share your
                    spells with the world.
                  </p>
                </div>
                <div className="mt-4 h-7 flex items-center">
                  {field.value === "CREATOR" && (
                    <Badge className="bg-creator text-white border-creator hover:bg-creator/90">
                      Selected
                    </Badge>
                  )}
                </div>
              </div>

              <div
                onClick={() => field.onChange("BUILDER")}
                className={cn(
                  "group relative p-6 rounded-[2rem] border bg-card/40 backdrop-blur-xl transition-all cursor-pointer text-left h-full flex flex-col justify-between",
                  field.value === "BUILDER"
                    ? "border-builder ring-2 ring-builder/20 shadow-xl shadow-builder/10"
                    : "border-border/60 hover:border-builder/50"
                )}
              >
                <div>
                  <div
                    className={cn(
                      "h-12 w-12 rounded-2xl flex items-center justify-center mb-6 border transition-all duration-300",
                      field.value === "BUILDER"
                        ? "bg-builder border-builder/20"
                        : "bg-builder/5 border-builder/5 group-hover:bg-builder/10"
                    )}
                  >
                    <Hammer
                      className={cn(
                        "h-6 w-6 transition-colors",
                        field.value === "BUILDER"
                          ? "text-white"
                          : "text-builder"
                      )}
                    />
                  </div>
                  <h3 className="text-xl font-bold font-heading mb-2">
                    I&apos;m a Builder
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Browse the marketplace, buy components, and build
                    faster than ever.
                  </p>
                </div>
                <div className="mt-4 h-7 flex items-center">
                  {field.value === "BUILDER" && (
                    <Badge className="bg-builder text-white border-builder hover:bg-builder/90">
                      Selected
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            <FormMessage />
          </FormItem>
        )}
      />

      <Button
        type="button"
        onClick={onNext}
        className="w-full h-12 rounded-2xl text-base font-bold shadow-lg shadow-primary/20"
        disabled={isLoading}
      >
        {isLoading ? (
          <Loader2 className="animate-spin h-5 w-5" />
        ) : (
          <>
            Continue to Profile <ArrowRight className="ml-2 h-5 w-5" />
          </>
        )}
      </Button>
    </div>
  );
}
