"use client";
import { ClerkProvider } from "@clerk/nextjs";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { OneSignalProvider } from "@/components/notifications/onesignal-provider";
import { Toaster } from "@/components/ui/sonner";

export default function Providers({ children }: { children: React.ReactNode }) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 60 * 1000,
      },
      mutations: {
        retry: 1,
        retryDelay: 1000,
      },
    },
  });
  return (
    <ClerkProvider
      appearance={{
        variables: {
          colorPrimary: "hsl(263, 70%, 50%)",
          borderRadius: "0.8rem",
          fontFamily: "var(--font-sans)",
        },
        elements: {
          card: "bg-card border border-border shadow-xl",
          navbar: "bg-card border-r border-border",
          userButtonPopoverCard:
            "bg-card border border-border shadow-xl backdrop-blur-xl",
          userButtonPopoverActionButton: "hover:bg-accent transition-colors",
          userButtonPopoverActionButtonText: "text-foreground font-medium",
          userButtonPopoverFooter: "hidden", // Hide "Secured by Clerk"
        },
      }}
    >
      <QueryClientProvider client={queryClient}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <OneSignalProvider />
          <Toaster />
          {children}
        </ThemeProvider>
      </QueryClientProvider>
    </ClerkProvider>
  );
}
