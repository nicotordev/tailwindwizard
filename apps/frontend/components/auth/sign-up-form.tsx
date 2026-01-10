"use client";
import { SignUp } from "@clerk/nextjs";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

export default function SignUpForm() {
  const [client, setClient] = useState(false);

  const signUpForm = (
    <SignUp
      routing="path"
      path="/auth/sign-up"
      signInUrl="/auth/sign-in"
      appearance={{
        variables: {
          borderRadius: "0.9rem",
          colorPrimary: "hsl(263, 70%, 50%)", // Fallback
        },
        elements: {
          rootBox: "w-full",
          card: "shadow-none border-0 bg-transparent p-0 w-full",
          header: "hidden",
          footer: "hidden",

          form: "gap-4",
          formFieldLabel: "text-sm font-medium text-foreground pb-1",
          formFieldInput:
            "h-10 rounded-md border border-input bg-background/50 backdrop-blur-sm px-3 text-sm text-foreground shadow-sm transition-all focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none",
          formButtonPrimary:
            "h-10 rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 hover:bg-primary/90 hover:scale-[1.02] active:scale-[0.98] transition-all focus:ring-2 focus:ring-primary focus:ring-offset-2",
          formFieldAction:
            "text-sm text-primary font-medium hover:text-primary/80 transition-colors uppercase tracking-tight text-[10px]",

          socialButtonsBlockButton:
            "h-11 rounded-md border border-input bg-background/50 backdrop-blur-sm px-3 text-sm font-medium text-foreground shadow-sm hover:bg-accent hover:text-accent-foreground transition-all hover:scale-[1.01]",
          socialButtonsBlockButtonText: "text-sm font-medium",
          socialButtonsProviderIcon: "w-5 h-5",

          dividerLine: "bg-border/60",
          dividerText:
            "text-[10px] font-bold uppercase tracking-widest text-muted-foreground bg-background",

          formFieldErrorText: "text-xs text-destructive font-medium",
          alertText: "text-sm",
        },
      }}
    />
  );

  useEffect(() => {
    setTimeout(() => {
      setClient(true);
    }, 100);
  }, []);

  if (!client) {
    return (
      <div className="flex w-full items-center justify-center">
        <Loader2 className="animate-spin w-9 h-9 text-primary/40" />
      </div>
    );
  }

  return signUpForm;
}
