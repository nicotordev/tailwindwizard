import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, User, Wand2 } from "lucide-react";
import Link from "next/link";
import HomeHeader from "@/components/layout/home-header";
import HomeFooter from "@/components/layout/home-footer";

export default async function OnboardingPage() {
  const user = await currentUser();

  // If user metadata says already onboarded, redirect to dashboard
  if (user?.publicMetadata?.onboardingComplete) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <HomeHeader />
      
      <main className="flex-1 flex items-center justify-center p-6 bg-[radial-gradient(circle_at_50%_50%,rgba(var(--primary-rgb),0.05),transparent_70%)]">
        <div className="w-full max-w-2xl text-center space-y-8">
          <div className="inline-flex h-20 w-20 items-center justify-center rounded-[2rem] bg-primary/10 border border-primary/20 shadow-2xl shadow-primary/10 mb-4">
            <Wand2 className="h-10 w-10 text-primary animate-pulse" />
          </div>
          
          <div className="space-y-4">
            <Badge variant="outline" className="px-4 py-1 border-primary/30 text-primary font-semibold tracking-widest uppercase text-[10px] animate-in fade-in slide-in-from-bottom-2 duration-700">
              Welcome, Initiate
            </Badge>
            <h1 className="text-4xl sm:text-6xl font-bold font-heading tracking-tight animate-in fade-in slide-in-from-bottom-4 duration-1000">
              Complete your <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent italic">Wizard Profile</span>
            </h1>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto animate-in fade-in slide-in-from-bottom-6 duration-1000">
              You're almost there, <span className="text-foreground font-semibold">{user?.firstName || "Wizard"}</span>. 
              Let's set up your workspace so you can start crafting components.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12 animate-in fade-in slide-in-from-bottom-8 duration-1000">
             <div className="group relative p-8 rounded-[2rem] border bg-card/40 backdrop-blur-xl hover:border-primary/50 transition-all text-left">
                <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 border border-primary/10 group-hover:bg-primary/20 transition-colors">
                   <User className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold font-heading mb-2">I'm a Creator</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Upload your blocks, earn revenue, and share your spells with the world.
                </p>
                <div className="mt-6 flex items-center text-xs font-bold text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                   SELECT ROLE <ArrowRight className="ml-2 h-3 w-3" />
                </div>
                <Link href="/onboarding/creator" className="absolute inset-0" />
             </div>

             <div className="group relative p-8 rounded-[2rem] border bg-card/40 backdrop-blur-xl hover:border-secondary/50 transition-all text-left">
                <div className="h-12 w-12 rounded-2xl bg-secondary/10 flex items-center justify-center mb-6 border border-secondary/10 group-hover:bg-secondary/20 transition-colors">
                   <Sparkles className="h-6 w-6 text-secondary" />
                </div>
                <h3 className="text-xl font-bold font-heading mb-2">I'm a Builder</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Browse the marketplace, buy components, and build faster than ever.
                </p>
                <div className="mt-6 flex items-center text-xs font-bold text-secondary opacity-0 group-hover:opacity-100 transition-opacity">
                   SELECT ROLE <ArrowRight className="ml-2 h-3 w-3" />
                </div>
                <Link href="/onboarding/builder" className="absolute inset-0" />
             </div>
          </div>

          <div className="pt-8 animate-in fade-in slide-in-from-bottom-10 duration-1000">
            <Button variant="ghost" size="sm" asChild className="text-muted-foreground hover:text-foreground">
               <Link href="/dashboard">Skip for now</Link>
            </Button>
          </div>
        </div>
      </main>

      <HomeFooter />
    </div>
  );
}
