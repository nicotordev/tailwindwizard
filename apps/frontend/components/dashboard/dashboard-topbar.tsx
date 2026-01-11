"use client";

import { UserButton } from "@clerk/nextjs";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { NotificationsMenu } from "@/components/notifications/notifications-menu";

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
        <NotificationsMenu />
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
