"use client";

import { useState } from "react";
import { useStripe, useElements, PaymentElement } from "@stripe/react-stripe-js";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export interface BuilderPaymentFormProps {
  onSuccess: () => void;
}

export function BuilderPaymentForm({ onSuccess }: BuilderPaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    if (!stripe || !elements) {
      toast.error("Stripe isn't ready yet. Please try again.");
      return;
    }

    setIsProcessing(true);

    const { error, setupIntent } = await stripe.confirmSetup({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/dashboard?onboarding=success`,
      },
      redirect: "if_required",
    });

    if (error) {
      toast.error(error.message || "Something went wrong with the ritual.");
      setIsProcessing(false);
      return;
    }

    if (
      setupIntent?.status === "succeeded" ||
      setupIntent?.status === "processing"
    ) {
      toast.success("Payment method secured!");
      onSuccess();
      return;
    }

    toast.error("Payment method needs additional verification.");
    setIsProcessing(false);
  };

  return (
    <div className="space-y-6">
      <PaymentElement />
      <Button
        type="button"
        onClick={handleSubmit}
        className="w-full h-12 rounded-2xl font-bold shadow-lg shadow-primary/20"
        disabled={isProcessing || !stripe}
      >
        {isProcessing ? (
          <Loader2 className="animate-spin h-5 w-5" />
        ) : (
          "Save Payment Method"
        )}
      </Button>
    </div>
  );
}
