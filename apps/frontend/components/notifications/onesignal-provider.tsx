"use client"

import { useEffect, useRef } from "react"
import { useUser } from "@clerk/nextjs"
import OneSignal, { type IInitObject } from "react-onesignal"

export function OneSignalProvider() {
  const { user, isLoaded, isSignedIn } = useUser()
  const appId = process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID
  const safariWebId = process.env.NEXT_PUBLIC_ONESIGNAL_SAFARI_WEB_ID
  const initPromise = useRef<Promise<void> | null>(null)

  useEffect(() => {
    if (!appId || initPromise.current) return

    const options: IInitObject = {
      appId,
      allowLocalhostAsSecureOrigin: true,
      serviceWorkerPath: "/OneSignalSDKWorker.js",
      serviceWorkerParam: { scope: "/" },
    }

    if (safariWebId) {
      options.safari_web_id = safariWebId
    }

    initPromise.current = OneSignal.init(options)
  }, [appId, safariWebId])

  const email = user?.primaryEmailAddress?.emailAddress

  useEffect(() => {
    if (!appId || !isLoaded || !initPromise.current) return

    initPromise.current
      .then(async () => {
        if (!isSignedIn || !user?.id) {
          await OneSignal.logout()
          return
        }

        await OneSignal.login(user.id)

        if (email) {
          OneSignal.User.addEmail(email)
        }
      })
      .catch((error) => {
        console.error("OneSignal init failed:", error)
      })
  }, [appId, email, isLoaded, isSignedIn, user?.id])

  return null
}
