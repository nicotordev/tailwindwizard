"use client";

import { useFormContext } from "react-hook-form";
import { Check, ArrowRight, Loader2, Layout, Layers, Globe, Shield, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { OnboardingFormData } from "../types";
import { useQuery } from "@tanstack/react-query";
import { frontendApi } from "@/lib/frontend-api";

// Map string icon names to components
const IconMap: Record<string, typeof Layout> = {
  Layout,
  Layers,
  Globe,
  Shield,
  Sparkles,
};

interface InterestsStepProps {
  onNext: () => void;
  onBack: () => void;
  isLoading: boolean;
}

export function InterestsStep({ onNext, onBack, isLoading }: InterestsStepProps) {
  const { watch, setValue, formState: { errors } } = useFormContext<OnboardingFormData>();
  const interests = watch("interests");

  const { data: categories, isLoading: isCategoriesLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data } = await frontendApi.categories.list();
      return data;
    },
  });

  const toggleInterest = (id: string) => {
    if (interests.includes(id)) {
      setValue(
        "interests",
        interests.filter((i) => i !== id),
        { shouldValidate: true, shouldDirty: true }
      );
      return;
    }
    setValue("interests", [...interests, id], {
      shouldValidate: true,
      shouldDirty: true,
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500 text-left">
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-bold font-heading">
            What are your specialties?
          </h3>
          <p className="text-sm text-muted-foreground">
            Select the categories that align with your magic.
          </p>
        </div>

        {isCategoriesLoading ? (
          <div className="flex h-40 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {categories?.map((cat) => {
              const Icon = (cat.icon && IconMap[cat.icon]) || Sparkles;
              const isSelected = interests.includes(cat.id); // Assuming backend category ID matches what we want to save
              return (
                <div
                  key={cat.id}
                  onClick={() => toggleInterest(cat.id)}
                  className={cn(
                    "relative flex flex-col items-center justify-center p-4 rounded-2xl border transition-all cursor-pointer group",
                    isSelected
                      ? "bg-primary/10 border-primary shadow-sm"
                      : "bg-card/40 border-border/60 hover:border-primary/40 hover:bg-primary/5"
                  )}
                >
                  <Icon
                    className={cn(
                      "h-6 w-6 mb-2 transition-colors",
                      isSelected
                        ? "text-primary"
                        : "text-muted-foreground group-hover:text-primary"
                    )}
                  />
                  <span
                    className={cn(
                      "text-xs font-medium text-center",
                      isSelected
                        ? "text-foreground"
                        : "text-muted-foreground"
                    )}
                  >
                    {cat.name}
                  </span>
                  {isSelected && (
                    <div className="absolute top-2 right-2 h-4 w-4 rounded-full bg-primary flex items-center justify-center">
                      <Check className="h-2.5 w-2.5 text-primary-foreground" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {errors.interests?.message && (
          <p className="text-xs text-destructive font-medium">
            {errors.interests.message}
          </p>
        )}
      </div>

      <div className="flex gap-4 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          className="flex-1 h-12 rounded-2xl"
        >
          Back
        </Button>
        <Button
          type="button"
          onClick={onNext}
          className="flex-[2] h-12 rounded-2xl font-bold shadow-lg shadow-primary/20"
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 className="animate-spin h-5 w-5" />
          ) : (
            <>
              Payment Setup <ArrowRight className="ml-2 h-5 w-5" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
