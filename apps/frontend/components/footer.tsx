import { Separator } from "@/components/ui/separator";
import Logo from "./logo";
import { Github, Twitter } from "lucide-react";
import Link from "next/link";

export function MarketFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border/40 bg-card/20 backdrop-blur-sm">
      <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-8 px-4 py-12 sm:px-6 lg:px-10">
        <div className="flex flex-col justify-between gap-8 md:flex-row">
          <div className="flex flex-col gap-4 max-w-md">
            <Logo size="md" />
            <p className="text-sm text-muted-foreground leading-relaxed">
              Zero-trust previews, AST validation, and controlled payouts with
              Stripe Connect. The secure standard for premium Tailwind components.
            </p>
          </div>
          <div className="flex gap-12">
            <div className="flex flex-col gap-3">
              <span className="text-xs font-bold uppercase tracking-widest text-foreground/70">Platform</span>
              <nav className="flex flex-col gap-2 text-sm text-muted-foreground">
                <Link href="#" className="hover:text-primary transition-colors">Documentation</Link>
                <Link href="#" className="hover:text-primary transition-colors">Security</Link>
                <Link href="#" className="hover:text-primary transition-colors">CLI</Link>
              </nav>
            </div>
            <div className="flex flex-col gap-3">
              <span className="text-xs font-bold uppercase tracking-widest text-foreground/70">Connect</span>
              <div className="flex gap-4">
                <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  <Twitter className="size-5" />
                </Link>
                <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  <Github className="size-5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
        
        <Separator className="bg-border/40" />
        
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <p className="text-xs text-muted-foreground font-medium">
            © {currentYear} TailwindWizard. All rights reserved. Secure by design.
          </p>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                Blockchain Sync: Active
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
