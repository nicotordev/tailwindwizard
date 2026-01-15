"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface MoneyProps extends React.ComponentProps<"span"> {
  amount: number | string
  currency?: string
  locale?: string
}

export function Money({ 
  amount, 
  currency = "USD", 
  locale = "en-US", 
  className,
  ...props 
}: MoneyProps) {
  const [mounted, setMounted] = React.useState(false)
  React.useEffect(() => {
    setMounted(true)
  }, [])

  const formatted = new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currency,
  }).format(Number(amount))

  if (!mounted) {
    return (
      <span className={cn("font-medium tabular-nums animate-pulse bg-muted rounded h-5 w-16 inline-block", className)} {...props} />
    )
  }

  return (
    <span className={cn("font-medium tabular-nums", className)} {...props}>
      {formatted}
    </span>
  )
}

interface DateDisplayProps extends React.ComponentProps<"time"> {
  date: string | Date
  format?: "short" | "long" | "relative"
}

export function DateDisplay({ 
  date, 
  format = "short", 
  className,
  ...props 
}: DateDisplayProps) {
  const [mounted, setMounted] = React.useState(false)
  React.useEffect(() => {
    setMounted(true)
  }, [])

  const d = typeof date === "string" ? new Date(date) : date
  
  if (!mounted) {
    return (
      <span className={cn("animate-pulse bg-muted rounded h-4 w-20 inline-block", className)} />
    )
  }

  let display = ""
  if (format === "relative") {
    // Basic relative format implementation or use a library like date-fns
    // For now, let's stick to standard Intl for simplicity
    const diff = new Date().getTime() - d.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    
    if (days === 0) display = "Today"
    else if (days === 1) display = "Yesterday"
    else if (days < 7) display = `${days} days ago`
    else display = d.toLocaleDateString()
  } else {
    display = d.toLocaleDateString(undefined, {
      year: "numeric",
      month: format === "long" ? "long" : "short",
      day: "numeric",
    })
  }

  return (
    <time 
      dateTime={d.toISOString()} 
      className={cn("text-muted-foreground", className)}
      {...props}
    >
      {display}
    </time>
  )
}
