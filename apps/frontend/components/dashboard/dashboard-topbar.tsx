"use client";

import { UserButton } from "@clerk/nextjs";
import { Bell, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function DashboardTopBar() {
  return (
    <header className="h-16 border-b bg-background/50 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between px-8">
      {/* Search */}
      <div className="relative w-full max-w-md hidden md:block">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search your library..."
          className="pl-10 h-10 bg-muted/50 border-none rounded-xl focus-visible:ring-1 focus-visible:ring-primary/20"
        />
      </div>

      {/* Right side */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="relative text-muted-foreground rounded-full hover:bg-primary/5">
          <Bell className="h-5 w-5" />
          <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-primary" />
        </Button>
        <div className="h-8 w-px bg-border mx-2" />
        <UserButton
          afterSignOutUrl="/"
          appearance={{
            elements: {
              userButtonAvatarBox: "h-9 w-9 rounded-xl border-2 border-primary/10",
              userButtonTrigger: "focus:shadow-none focus:ring-2 focus:ring-primary/20 rounded-xl",
            },
          }}
        />
      </div>
    </header>
  );
}
