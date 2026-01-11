"use client"

import { BuyerView } from "@/components/dashboard/buyer-view"
import { CreatorView } from "@/components/dashboard/creator-view"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import type { SerializedUser } from "@/utils/serialization"

interface DashboardShellProps {
  user: SerializedUser
  isCreator: boolean
}

export function DashboardShell({ user, isCreator }: DashboardShellProps) {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
           <Badge variant="secondary">Dashboard</Badge>
           {isCreator && <Badge variant="outline" className="border-primary/50 text-primary">Creator Account</Badge>}
        </div>
        <h1 className="text-4xl font-bold font-heading tracking-tight">
          Welcome back, <span className="text-primary">{user?.firstName || "Wizard"}</span> ✨
        </h1>
        <p className="text-muted-foreground max-w-2xl">
          {isCreator
            ? "Manage your components, track sales, and view your performance."
            : "Access your purchased components and explore the marketplace."
          }
        </p>
      </div>

      {isCreator ? (
        <Tabs defaultValue="creator" className="space-y-6">
          <div className="flex items-center justify-between">
             <TabsList>
              <TabsTrigger value="creator">Creator View</TabsTrigger>
              <TabsTrigger value="buyer">Buyer View</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="creator" className="animate-in fade-in-50 duration-500">
            <CreatorView />
          </TabsContent>

          <TabsContent value="buyer" className="animate-in fade-in-50 duration-500">
            <BuyerView />
          </TabsContent>
        </Tabs>
      ) : (
        <BuyerView />
      )}
    </div>
  )
}
