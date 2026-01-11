"use client"

import * as React from "react"
import { 
  BlockStatusBadge, 
  StripeStatusBadge, 
  LicenseBadge, 
  DeliveryStatusBadge,
  type BlockStatus,
  type StripeStatus,
  type LicenseStatus,
  type DeliveryStatus
} from "@/components/primitives/status-badges"
import { Money, DateDisplay } from "@/components/primitives/formatters"
import { EmptyState } from "@/components/primitives/empty-state"
import { RoleGate } from "@/components/primitives/role-gate"
import { VisibilityToggle, type Visibility } from "@/components/primitives/visibility-toggle"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Package, Search } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function DevUiPage() {
  const [visibility, setVisibility] = React.useState<Visibility>('PUBLIC')

  return (
    <div className="container mx-auto py-10 space-y-8">
      <div>
        <h1 className="text-4xl font-bold tracking-tight">Core Primitives Library</h1>
        <p className="text-muted-foreground mt-2">
          Visualizing the base components for TailwindWizard.
        </p>
      </div>

      <Tabs defaultValue="badges">
        <TabsList className="grid w-full grid-cols-4 max-w-2xl">
          <TabsTrigger value="badges">Status Badges</TabsTrigger>
          <TabsTrigger value="formatters">Formatters</TabsTrigger>
          <TabsTrigger value="logic">Logic & Toggles</TabsTrigger>
          <TabsTrigger value="layouts">Empty States</TabsTrigger>
        </TabsList>

        <TabsContent value="badges" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Block Status</CardTitle>
                <CardDescription>Workflow states for code blocks.</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                {(['DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED', 'PUBLISHED', 'UNPUBLISHED', 'ARCHIVED'] as BlockStatus[]).map(s => (
                  <BlockStatusBadge key={s} status={s} />
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Stripe Connect</CardTitle>
                <CardDescription>Seller onboarding and account status.</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                {(['NOT_CONNECTED', 'PENDING', 'ENABLED', 'RESTRICTED', 'REJECTED'] as StripeStatus[]).map(s => (
                  <StripeStatusBadge key={s} status={s} />
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>License Status</CardTitle>
                <CardDescription>Active or revoked licenses.</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                {(['ACTIVE', 'REVOKED'] as LicenseStatus[]).map(s => (
                  <LicenseBadge key={s} status={s} />
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Delivery Status</CardTitle>
                <CardDescription>Asset readiness for downloads.</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                {(['NOT_READY', 'READY', 'REVOKED'] as DeliveryStatus[]).map(s => (
                  <DeliveryStatusBadge key={s} status={s} />
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="formatters" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Money Formatter</CardTitle>
                <CardDescription>Consistent currency formatting.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between border-b pb-2">
                  <span className="text-sm font-medium">Default (USD)</span>
                  <Money amount={49} />
                </div>
                <div className="flex items-center justify-between border-b pb-2">
                  <span className="text-sm font-medium">EUR</span>
                  <Money amount={1200.50} currency="EUR" locale="de-DE" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">CLP</span>
                  <Money amount={15000} currency="CLP" locale="es-CL" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Date Display</CardTitle>
                <CardDescription>ISO date formatting.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between border-b pb-2">
                  <span className="text-sm font-medium">Short Format</span>
                  <DateDisplay date={new Date()} />
                </div>
                <div className="flex items-center justify-between border-b pb-2">
                  <span className="text-sm font-medium">Long Format</span>
                  <DateDisplay date={new Date()} format="long" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Relative (Today)</span>
                  <DateDisplay date={new Date()} format="relative" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="logic" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Visibility Toggle</CardTitle>
                <CardDescription>Handle entity visibility states.</CardDescription>
              </CardHeader>
              <CardContent>
                <VisibilityToggle value={visibility} onChange={setVisibility} />
                <p className="mt-4 text-sm text-muted-foreground">
                  Current state: <span className="font-mono text-foreground uppercase">{visibility}</span>
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Role Gate</CardTitle>
                <CardDescription>Permission handling wrapper.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 border rounded-lg bg-muted/50 text-sm">
                  <p className="mb-2 font-medium italic text-muted-foreground">Example (Admin only content):</p>
                  <RoleGate role="ADMIN" fallback={<p className="text-destructive">You don&apos;t have admin access.</p>}>
                    <p className="text-green-600 font-medium">Restricted Admin Data visible!</p>
                  </RoleGate>
                </div>
                
                <div className="p-4 border rounded-lg bg-muted/50 text-sm">
                  <p className="mb-2 font-medium italic text-muted-foreground">Example (Creator content):</p>
                  <RoleGate role="CREATOR" fallback={<p className="text-orange-500">Only creators can see this.</p>}>
                    <p className="text-blue-600 font-medium">Creator Dashboard Widget visible!</p>
                  </RoleGate>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="layouts" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Empty State</CardTitle>
              <CardDescription>Reusable placeholder for empty lists and searches.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="border rounded-xl p-4">
                <p className="mb-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Search Results</p>
                <EmptyState 
                  title="No components found" 
                  description="We couldn't find any components matching your search criteria."
                  icon={Search}
                  action={{
                    label: "Clear Search",
                    onClick: () => console.log("Clear search")
                  }}
                />
              </div>

              <div className="border rounded-xl p-4">
                <p className="mb-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">User Library</p>
                <EmptyState 
                  title="Your library is empty" 
                  description="You haven't purchased any components yet. Explore the marketplace to get started."
                  icon={Package}
                  action={{
                    label: "Explore Marketplace",
                    href: "/explore"
                  }}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
