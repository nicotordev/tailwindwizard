"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { frontendApi, type Schema } from "@/lib/frontend-api";
import {
  onboardingSchema,
  OnboardingFormData,
  OnboardingStep,
  STEP_ORDER,
} from "@/components/onboarding/types";
import type { SerializedUser } from "@/utils/serialization";
import { updateCreatorProfile } from "@/app/actions";

interface UseOnboardingWizardProps {
  initialUser: SerializedUser;
}

export function useOnboardingWizard({ initialUser }: UseOnboardingWizardProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [step, setStep] = useState<OnboardingStep>("role");
  const [isLoading, setIsLoading] = useState(false);
  const [setupIntentSecret, setSetupIntentSecret] = useState<string | null>(
    null
  );

  const form = useForm<OnboardingFormData>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      role: "BUILDER",
      displayName: initialUser.firstName || "",
      bio: "",
      country: "CL",
      websiteUrl: "",
      githubUsername: "",
      twitterUsername: "",
      interests: [],
      imageUrl: initialUser.imageUrl || "",
    },
    mode: "onTouched",
  });

  const stepIndex = useMemo(() => STEP_ORDER.indexOf(step), [step]);
  const role = form.watch("role");

  // Restore step from URL
  useEffect(() => {
    const stepParam = searchParams.get("step") as OnboardingStep;
    if (STEP_ORDER.includes(stepParam)) {
      setStep(stepParam);
    }
  }, [searchParams]);

  // Create SetupIntent for Builders when entering payment step
  useEffect(() => {
    if (step !== "payment" || role !== "BUILDER" || setupIntentSecret) return;

    const createIntent = async () => {
      try {
        const { data } = await frontendApi.users.createSetupIntent();
        setSetupIntentSecret(data.clientSecret);
      } catch (error) {
        console.error("Failed to create SetupIntent", error);
        toast.error("Failed to prepare payment setup. Try again.");
      }
    };

    void createIntent();
  }, [role, setupIntentSecret, step]);

  // Handle Stripe return for creators
  useEffect(() => {
    const stripeReturn = searchParams.get("stripe_return");
    if (stripeReturn === "success") {
      const completeCreatorOnboarding = async () => {
        setIsLoading(true);
        try {
          await frontendApi.users.finishOnboarding({ role: "CREATOR" });
          toast.success("Welcome, Creator!");
          router.push("/dashboard");
        } catch (error) {
          console.error("Failed to complete creator onboarding:", error);
          toast.error("Failed to complete setup. Please contact support.");
        } finally {
          setIsLoading(false);
        }
      };

      void completeCreatorOnboarding();
    }
  }, [searchParams, router]);

  const saveProgress = useCallback(async (): Promise<void> => {
    const values = form.getValues();

    await frontendApi.users.updateMe({
      name: values.displayName,
      avatarUrl: values.imageUrl,
    });

    const userId = initialUser.id;

    await updateCreatorProfile(userId, values.role);

    if (values.role === "CREATOR") {
      const creatorData: Schema["UpdateCreator"] = {
        displayName: values.displayName,
        bio: values.bio,
        websiteUrl: values.websiteUrl || undefined,
        countryCode: values.country,
      };

      try {
        await frontendApi.creators.updateMe(creatorData);
      } catch (error) {
        const errorObject = error as { response?: { status?: number } };
        if (errorObject?.response?.status === 404) {
          await frontendApi.creators.createMe(creatorData);
        } else {
          console.error("Creator profile update error:", error);
          throw error;
        }
      }
    }
  }, [form, initialUser.id]);

  const validateStep = useCallback(
    async (s: OnboardingStep): Promise<boolean> => {
      const fields: Array<keyof OnboardingFormData> =
        s === "role"
          ? ["role"]
          : s === "profile"
          ? [
              "displayName",
              "country",
              "bio",
              "websiteUrl",
              "githubUsername",
              "twitterUsername",
            ]
          : s === "interests"
          ? ["interests"]
          : [];

      if (fields.length === 0) return true;
      return form.trigger(fields);
    },
    [form]
  );

  const handleNextStep = async () => {
    const ok = await validateStep(step);
    if (!ok) return;

    setIsLoading(true);
    try {
      await saveProgress();
      const next = STEP_ORDER[Math.min(stepIndex + 1, STEP_ORDER.length - 1)];
      setStep(next);
    } catch (error) {
      console.error(error);
      toast.error("Could not save your progress. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackStep = () => {
    const prev = STEP_ORDER[Math.max(stepIndex - 1, 0)];
    setStep(prev);
  };

  const finishBuilder = async () => {
    setIsLoading(true);
    try {
      await saveProgress();
      await frontendApi.users.finishOnboarding({ role: "BUILDER" });
      toast.success("Welcome to the Block Economy!");
      router.push("/dashboard");
    } catch (error) {
      console.error(error);
      toast.error("Failed to finish. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const connectCreatorStripe = async () => {
    const okRole = await validateStep("role");
    const okProfile = await validateStep("profile");
    const okInterests = await validateStep("interests");
    if (!okRole || !okProfile || !okInterests) return;

    setIsLoading(true);
    const toastId = toast.loading("Preparing Stripe connection...");

    try {
      await saveProgress();

      const baseUrl = window.location.origin;
      const {
        data: { url },
      } = await frontendApi.creators.onboard({
        returnUrl: `${baseUrl}/onboarding?step=payment&stripe_return=success`,
        refreshUrl: `${baseUrl}/onboarding?step=payment`,
      });

      if (!url) {
        toast.error("Failed to start Stripe onboarding.", { id: toastId });
        setIsLoading(false);
        return;
      }

      toast.success("Redirecting to Stripe...", { id: toastId });
      window.location.href = url;
    } catch (error) {
      console.error(error);
      toast.error("Failed to start Stripe onboarding.", { id: toastId });
      setIsLoading(false);
    }
  };

  return {
    step,
    stepIndex,
    form,
    isLoading,
    setupIntentSecret,
    handleNextStep,
    handleBackStep,
    finishBuilder,
    connectCreatorStripe,
  };
}
