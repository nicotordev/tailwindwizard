"use client"

import { UserButton } from "@clerk/nextjs"
import { Bell, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"

export function AdminTopBar() {
  return (
    <header className="h-16 border-b bg-background/50 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between px-8">
      <div className="flex items-center gap-3 text-sm font-semibold">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Shield className="size-4" />
        </div>
        Admin Operations
      </div>
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
  )
}
