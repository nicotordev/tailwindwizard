import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Logo from "./logo";
import { Sparkles } from "lucide-react";

const NAV_ITEMS = [
  { label: "Marketplace", href: "/market", active: true },
  { label: "Trending", href: "#" },
  { label: "Creators", href: "#" },
  { label: "Pricing", href: "#" },
];

export function MarketNavbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/40 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-[1440px] items-center justify-between px-4 py-3 sm:px-6 lg:px-10">
        <div className="flex items-center gap-8">
          <Logo size="md" />
          <nav className="hidden items-center gap-1 text-sm font-medium md:flex">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="group relative flex items-center gap-2 px-3 py-2 text-muted-foreground transition-colors hover:text-primary"
                aria-current={item.active ? "page" : undefined}
              >
                {item.label}
                {item.active && (
                  <span className="absolute -bottom-[13px] left-0 h-[2px] w-full bg-primary" />
                )}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" className="hidden sm:inline-flex text-muted-foreground hover:text-primary">
            Install CLI
          </Button>
          <Button size="sm" className="gap-2 rounded-xl px-5">
            <Sparkles className="size-4" />
            Get Started
          </Button>
          <div className="h-6 w-px bg-border/60 mx-1" />
          <Select defaultValue="en">
            <SelectTrigger className="h-9 w-[100px] rounded-xl border-border/50 bg-muted/30" aria-label="Language">
              <SelectValue placeholder="Lang" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="en">English</SelectItem>
              <SelectItem value="es">Español</SelectItem>
              <SelectItem value="pt">Português</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </header>
  );
}
