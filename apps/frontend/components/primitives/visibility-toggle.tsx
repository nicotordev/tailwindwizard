"use client"

import * as React from "react"
import {
  Eye,
  EyeOff,
  Link as LinkIcon,
  Check,
  ChevronDown
} from "lucide-react"
import { cn } from "@/lib/utils"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"

export type Visibility = 'PRIVATE' | 'UNLISTED' | 'PUBLIC'

interface VisibilityToggleProps {
  value: Visibility
  onChange?: (value: Visibility) => void
  disabled?: boolean
  className?: string
}

const visibilityConfig: Record<Visibility, { label: string; description: string; icon: React.ReactNode }> = {
  PUBLIC: {
    label: "Public",
    description: "Visible to everyone in the marketplace.",
    icon: <Eye className="size-4" />,
  },
  UNLISTED: {
    label: "Unlisted",
    description: "Only visible to people with the link.",
    icon: <LinkIcon className="size-4" />,
  },
  PRIVATE: {
    label: "Private",
    description: "Only visible to you.",
    icon: <EyeOff className="size-4" />,
  },
}

export function VisibilityToggle({
  value,
  onChange,
  disabled,
  className
}: VisibilityToggleProps) {
  const selected = visibilityConfig[value]

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className={cn("justify-between gap-2 px-3", className)}
          disabled={disabled}
        >
          <span className="flex items-center gap-2">
            {selected.icon}
            {selected.label}
          </span>
          <ChevronDown className="size-4 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-60">
        {(Object.entries(visibilityConfig) as [Visibility, typeof selected][]).map(([key, config]) => (
          <DropdownMenuItem
            key={key}
            className="flex flex-col items-start gap-1 py-2"
            onSelect={() => onChange?.(key)}
          >
            <div className="flex w-full items-center justify-between">
              <span className="flex items-center gap-2 font-medium">
                {config.icon}
                {config.label}
              </span>
              {value === key && <Check className="size-4 text-primary" />}
            </div>
            <p className="text-muted-foreground text-xs leading-tight">
              {config.description}
            </p>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
