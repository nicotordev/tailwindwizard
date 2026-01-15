"use client"

import { useEffect, useState } from "react"
import { UserButton } from "@clerk/nextjs"
import { Shield } from "lucide-react"
import { NotificationsMenu } from "@/components/notifications/notifications-menu"

export function AdminTopBar() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <header className="h-16 border-b bg-background/50 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between px-8">
      <div className="flex items-center gap-3 text-sm font-semibold">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Shield className="size-4" />
        </div>
        Admin Operations
      </div>
      <div className="flex items-center gap-4">
        <NotificationsMenu showViewAll={false} />
        <div className="h-8 w-px bg-border mx-2" />
        {mounted ? (
          <UserButton
            afterSignOutUrl="/"
            appearance={{
              elements: {
                userButtonAvatarBox:
                  "h-9 w-9 rounded-xl border-2 border-primary/10",
                userButtonTrigger:
                  "focus:shadow-none focus:ring-2 focus:ring-primary/20 rounded-xl",
              },
            }}
          />
        ) : (
          <div className="h-9 w-9 rounded-xl bg-muted animate-pulse" />
        )}
      </div>
    </header>
  )
}
