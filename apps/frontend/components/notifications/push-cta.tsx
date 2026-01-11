"use client"

import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { CheckCircle2 } from "lucide-react"
import OneSignal from "react-onesignal"

export function PushCta() {
  const appId = process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID

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
    <Button
      variant="secondary"
      className="rounded-xl gap-2"
      onClick={handleEnablePush}
    >
      <CheckCircle2 className="size-4" />
      Enable push notifications
    </Button>
  )
}
