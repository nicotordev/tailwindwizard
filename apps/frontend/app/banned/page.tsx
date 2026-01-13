"use client";

import { SignOutButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { ShieldAlert, LogOut } from "lucide-react";

export default function BannedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="max-w-md w-full space-y-8 text-center animate-in fade-in zoom-in duration-500">
        <div className="flex justify-center">
          <div className="p-4 rounded-full bg-destructive/10 text-destructive shadow-2xl shadow-destructive/20 border border-destructive/20">
            <ShieldAlert className="size-16" />
          </div>
        </div>
        
        <div className="space-y-3">
          <h1 className="text-4xl font-heading font-bold tracking-tight text-foreground">
            Account Restricted
          </h1>
          <p className="text-muted-foreground text-lg leading-relaxed">
            Your access to TailwindWizard has been revoked due to a violation of our Terms of Service or community guidelines.
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-muted/30 border border-border/40 text-sm text-left space-y-4">
          <div className="space-y-1">
            <p className="font-bold text-foreground uppercase tracking-widest text-[10px]">What does this mean?</p>
            <p className="text-muted-foreground">You can no longer purchase components, upload new blocks, or manage your existing creations.</p>
          </div>
          
          <div className="space-y-1">
            <p className="font-bold text-foreground uppercase tracking-widest text-[10px]">Need to appeal?</p>
            <p className="text-muted-foreground">If you believe this is a mistake, contact support@tailwindwizard.com with your account details.</p>
          </div>
        </div>

        <div className="pt-4">
          <SignOutButton>
            <Button size="lg" className="w-full rounded-2xl h-14 font-bold shadow-xl shadow-primary/10 transition-all hover:scale-[1.02]">
              <LogOut className="mr-2 size-5" />
              Sign Out
            </Button>
          </SignOutButton>
        </div>
        
        <p className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-[0.2em]">
          Protocol Termination • Error Code 403_RESTRICTED
        </p>
      </div>
    </div>
  );
}
