"use client";

import { FormProvider } from "react-hook-form";
import { cn } from "@/lib/utils";
import type { SerializedUser } from "@/utils/serialization";
import { STEP_ORDER } from "./types";
import { RoleStep } from "./steps/RoleStep";
import { ProfileStep } from "./steps/ProfileStep";
import { InterestsStep } from "./steps/InterestsStep";
import { PaymentStep } from "./steps/PaymentStep";
import { useOnboardingWizard } from "@/hooks/use-onboarding-wizard";

export interface OnBoardingWizardProps {
  initialUser: SerializedUser;
}

export default function OnboardingWizard({
  initialUser,
}: OnBoardingWizardProps) {
  const {
    step,
    stepIndex,
    form,
    isLoading,
    setupIntentSecret,
    handleNextStep,
    handleBackStep,
    finishBuilder,
    connectCreatorStripe,
  } = useOnboardingWizard({ initialUser });

  return (
    <div className="w-full max-w-xl mx-auto">
      {/* Progress Indicator */}
      <div className="flex justify-center gap-2 mb-8">
        {STEP_ORDER.map((s, idx) => {
          const isActive = step === s;
          const isDone = stepIndex > idx;
          return (
            <div
              key={s}
              className={cn(
                "h-1 rounded-full transition-all duration-500",
                isActive ? "w-8 bg-primary" : "w-2 bg-border",
                isDone ? "bg-primary/50" : ""
              )}
            />
          );
        })}
      </div>

      <FormProvider {...form}>
        <div className="space-y-8">
          {step === "role" && (
            <RoleStep onNext={handleNextStep} isLoading={isLoading} />
          )}

          {step === "profile" && (
            <ProfileStep
              onNext={handleNextStep}
              onBack={handleBackStep}
              isLoading={isLoading}
              initialUser={initialUser}
            />
          )}

          {step === "interests" && (
            <InterestsStep
              onNext={handleNextStep}
              onBack={handleBackStep}
              isLoading={isLoading}
            />
          )}

          {step === "payment" && (
            <PaymentStep
              onBack={handleBackStep}
              onFinish={finishBuilder}
              onConnectStripe={() => void connectCreatorStripe()}
              isLoading={isLoading}
              setupIntentSecret={setupIntentSecret}
            />
          )}
        </div>
      </FormProvider>
    </div>
  );
}