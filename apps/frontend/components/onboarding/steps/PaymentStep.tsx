"use client";

import { useFormContext } from "react-hook-form";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { Landmark, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BuilderPaymentForm } from "./BuilderPaymentForm";
import { OnboardingFormData } from "../types";

const stripePublicKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? "";
const stripePromise = stripePublicKey ? loadStripe(stripePublicKey) : null;

interface PaymentStepProps {
  onBack: () => void;
  onFinish: () => void;
  onConnectStripe: () => void;
  isLoading: boolean;
  setupIntentSecret: string | null;
}

export function PaymentStep({
  onBack,
  onFinish,
  onConnectStripe,
  isLoading,
  setupIntentSecret,
}: PaymentStepProps) {
  const { watch } = useFormContext<OnboardingFormData>();
  const role = watch("role");

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500 text-left">
      <div className="p-6 rounded-[2rem] border border-primary/20 bg-primary/5 space-y-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary/20 flex items-center justify-center">
            <Landmark className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h4 className="font-bold font-heading">
              {role === "CREATOR"
                ? "Payout Infrastructure"
                : "Secure Payments"}
            </h4>
            <p className="text-xs text-muted-foreground uppercase tracking-widest">
              Powered by Stripe
            </p>
          </div>
        </div>

        <p className="text-sm text-muted-foreground leading-relaxed">
          {role === "CREATOR"
            ? "We use Stripe-hosted onboarding to keep your data secure and ensure you get paid globally."
            : "Save your payment method to enable one-click purchases and seamless block acquisition."}
        </p>
      </div>

      {role === "BUILDER" ? (
        !stripePromise ? (
          <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-muted-foreground">
            Stripe publishable key is missing. Set{" "}
            <code className="font-mono">
              NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
            </code>{" "}
            to enable payment setup.
          </div>
        ) : setupIntentSecret ? (
          <Elements
            stripe={stripePromise}
            options={{
              clientSecret: setupIntentSecret,
              appearance: { theme: "night" },
            }}
          >
            <BuilderPaymentForm onSuccess={onFinish} />
          </Elements>
        ) : (
          <div className="flex justify-center p-12">
            <Loader2 className="animate-spin h-8 w-8 text-primary" />
          </div>
        )
      ) : (
        <div className="space-y-6">
          <div className="space-y-4 text-center">
            <p className="text-xs text-muted-foreground uppercase tracking-widest leading-loose">
              Click below to begin the Stripe connection process in a
              secure hosted window.
            </p>
          </div>

          <div className="flex gap-4">
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
              onClick={onConnectStripe}
              className="flex-2 h-12 rounded-2xl font-bold shadow-lg shadow-primary/20"
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="animate-spin h-5 w-5" />
              ) : (
                "Connect Stripe Account"
              )}
            </Button>
          </div>
        </div>
      )}

      {role === "BUILDER" && (
        <Button
          type="button"
          variant="ghost"
          onClick={onFinish}
          className="w-full text-xs text-muted-foreground hover:text-primary"
          disabled={isLoading}
        >
          Skip for now, I&apos;ll do it later
        </Button>
      )}
    </div>
  );
}
