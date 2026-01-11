"use client"

import * as React from "react"
import Link from "next/link"
import { toast } from "sonner"
import OneSignal from "react-onesignal"
import { Bell, CheckCircle2, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

type NotificationItem = {
  id: string
  title: string
  description: string
  time: string
  read?: boolean
}

const sampleNotifications: NotificationItem[] = []

export function NotificationsMenu({
  className,
  showViewAll = true,
}: {
  className?: string
  showViewAll?: boolean
}) {
  const appId = process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID
  const unreadCount = sampleNotifications.filter((item) => !item.read).length

  const handleEnablePush = () => {
    if (!appId) {
      toast.message("Set NEXT_PUBLIC_ONESIGNAL_APP_ID to enable push.")
      return
    }
    OneSignal.Slidedown.promptPush().catch(() => {
      toast.message("Push prompt could not be displayed.")
    })
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "relative text-muted-foreground rounded-full hover:bg-primary/5",
            className
          )}
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-primary" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[320px] rounded-2xl p-2">
        <div className="px-3 py-2">
          <p className="text-sm font-semibold">Notifications</p>
          <p className="text-xs text-muted-foreground">
            Updates from your marketplace activity.
          </p>
        </div>
        <DropdownMenuSeparator />
        {sampleNotifications.length ? (
          sampleNotifications.map((item) => (
            <DropdownMenuItem key={item.id} className="rounded-xl p-3 gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Sparkles className="size-4" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">{item.title}</p>
                <p className="text-xs text-muted-foreground">{item.description}</p>
                <p className="text-[10px] text-muted-foreground mt-1">{item.time}</p>
              </div>
            </DropdownMenuItem>
          ))
        ) : (
          <div className="px-4 py-6 text-center text-sm text-muted-foreground">
            No notifications yet.
          </div>
        )}
        <DropdownMenuSeparator />
        <div className="px-3 pb-2 pt-1 space-y-2">
          <Button
            variant="secondary"
            className="w-full rounded-xl gap-2"
            onClick={handleEnablePush}
          >
            <CheckCircle2 className="size-4" />
            Enable push notifications
          </Button>
          {showViewAll && (
            <Button asChild variant="ghost" className="w-full rounded-xl">
              <Link href="/dashboard/notifications">View all updates</Link>
            </Button>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
