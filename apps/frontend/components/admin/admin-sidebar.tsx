"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Gavel,
  Users,
  Wallet,
  Shield,
} from "lucide-react"

const adminNav = [
  { title: "Overview", href: "/admin", icon: LayoutDashboard },
  { title: "Moderation", href: "/admin/blocks", icon: Gavel },
  { title: "Creators", href: "/admin/creators", icon: Users },
  { title: "Finance", href: "/admin/finance", icon: Wallet },
]

export function AdminSidebar() {
  const pathname = usePathname()

  return (
    <aside className="flex h-screen w-[260px] flex-col border-r bg-card/30 backdrop-blur-xl">
      <div className="flex h-16 items-center gap-2 px-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Shield className="size-4" />
        </div>
        <div>
          <p className="text-sm font-semibold">Admin Console</p>
          <p className="text-xs text-muted-foreground">TailwindWizard</p>
        </div>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-2">
        {adminNav.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                  : "text-muted-foreground hover:bg-primary/5 hover:text-foreground"
              )}
            >
              <Icon className="size-4" />
              {item.title}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
