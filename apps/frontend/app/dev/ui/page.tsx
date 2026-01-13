"use client";

import { EmptyState } from "@/components/primitives/empty-state";
import { DateDisplay, Money } from "@/components/primitives/formatters";
import { RoleGate } from "@/components/primitives/role-gate";
import {
  BlockStatusBadge,
  DeliveryStatusBadge,
  LicenseBadge,
  StripeStatusBadge,
  type BlockStatus,
  type DeliveryStatus,
  type LicenseStatus,
  type StripeStatus,
} from "@/components/primitives/status-badges";
import {
  VisibilityToggle,
  type Visibility,
} from "@/components/primitives/visibility-toggle";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Package, Search, Sparkles, Wand2 } from "lucide-react";
import * as React from "react";

export default function DevUiPage() {
  const [visibility, setVisibility] = React.useState<Visibility>("PUBLIC");

  return (
    <div className="py-8 space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 text-primary">
          <Wand2 className="size-5" />
          <span className="text-xs font-bold uppercase tracking-[0.2em]">
            Design System
          </span>
        </div>
        <h1 className="text-4xl font-bold tracking-tight font-heading">
          Core Primitives
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl">
          Visualizing the base components and design tokens that build the
          TailwindWizard ecosystem.
        </p>
      </div>

      <Tabs defaultValue="badges" className="space-y-8">
        <TabsList className="inline-flex h-12 items-center justify-center rounded-4xl bg-muted/50 p-1.5 text-muted-foreground border border-border/40 backdrop-blur-sm">
          <TabsTrigger
            value="badges"
            className="rounded-xl px-6 py-2 text-sm font-bold data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-lg shadow-primary/5 transition-all"
          >
            Status Badges
          </TabsTrigger>
          <TabsTrigger
            value="formatters"
            className="rounded-xl px-6 py-2 text-sm font-bold data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-lg shadow-primary/5 transition-all"
          >
            Formatters
          </TabsTrigger>
          <TabsTrigger
            value="logic"
            className="rounded-xl px-6 py-2 text-sm font-bold data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-lg shadow-primary/5 transition-all"
          >
            Logic & Toggles
          </TabsTrigger>
          <TabsTrigger
            value="layouts"
            className="rounded-xl px-6 py-2 text-sm font-bold data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-lg shadow-primary/5 transition-all"
          >
            Empty States
          </TabsTrigger>
        </TabsList>

        <TabsContent
          value="badges"
          className="space-y-8 animate-in fade-in-50 duration-500"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="bg-card/40 backdrop-blur-xl border-border/50 rounded-[2rem] overflow-hidden shadow-sm">
              <CardHeader className="bg-muted/5 border-b border-border/10 pb-6">
                <CardTitle className="font-heading text-xl">
                  Block Status
                </CardTitle>
                <CardDescription>
                  Workflow states for code blocks in the marketplace.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-8 flex flex-wrap gap-3">
                {(
                  [
                    "DRAFT",
                    "SUBMITTED",
                    "APPROVED",
                    "REJECTED",
                    "PUBLISHED",
                    "UNPUBLISHED",
                    "ARCHIVED",
                  ] as BlockStatus[]
                ).map((s) => (
                  <BlockStatusBadge key={s} status={s} />
                ))}
              </CardContent>
            </Card>

            <Card className="bg-card/40 backdrop-blur-xl border-border/50 rounded-[2rem] overflow-hidden shadow-sm">
              <CardHeader className="bg-muted/5 border-b border-border/10 pb-6">
                <CardTitle className="font-heading text-xl">
                  Stripe Connect
                </CardTitle>
                <CardDescription>
                  Seller onboarding and financial account status.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-8 flex flex-wrap gap-3">
                {(
                  [
                    "NOT_CONNECTED",
                    "PENDING",
                    "ENABLED",
                    "RESTRICTED",
                    "REJECTED",
                  ] as StripeStatus[]
                ).map((s) => (
                  <StripeStatusBadge key={s} status={s} />
                ))}
              </CardContent>
            </Card>

            <Card className="bg-card/40 backdrop-blur-xl border-border/50 rounded-[2rem] overflow-hidden shadow-sm">
              <CardHeader className="bg-muted/5 border-b border-border/10 pb-6">
                <CardTitle className="font-heading text-xl">
                  License Status
                </CardTitle>
                <CardDescription>
                  Validation of user ownership rights.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-8 flex flex-wrap gap-3">
                {(["ACTIVE", "REVOKED"] as LicenseStatus[]).map((s) => (
                  <LicenseBadge key={s} status={s} />
                ))}
              </CardContent>
            </Card>

            <Card className="bg-card/40 backdrop-blur-xl border-border/50 rounded-[2rem] overflow-hidden shadow-sm">
              <CardHeader className="bg-muted/5 border-b border-border/10 pb-6">
                <CardTitle className="font-heading text-xl">
                  Delivery Status
                </CardTitle>
                <CardDescription>
                  Real-time asset readiness for downloads.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-8 flex flex-wrap gap-3">
                {(["NOT_READY", "READY", "REVOKED"] as DeliveryStatus[]).map(
                  (s) => (
                    <DeliveryStatusBadge key={s} status={s} />
                  )
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent
          value="formatters"
          className="space-y-8 animate-in fade-in-50 duration-500"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="bg-card/40 backdrop-blur-xl border-border/50 rounded-[2rem] overflow-hidden shadow-sm">
              <CardHeader className="bg-muted/5 border-b border-border/10 pb-6">
                <CardTitle className="font-heading text-xl">
                  Money Formatter
                </CardTitle>
                <CardDescription>
                  Consistent currency representation across regions.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-8 space-y-6">
                <div className="flex items-center justify-between p-4 rounded-2xl bg-muted/20 border border-border/40">
                  <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                    Default (USD)
                  </span>
                  <Money amount={49} className="text-lg font-bold" />
                </div>
                <div className="flex items-center justify-between p-4 rounded-2xl bg-muted/20 border border-border/40">
                  <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                    EUR / Germany
                  </span>
                  <Money
                    amount={1200.5}
                    currency="EUR"
                    locale="de-DE"
                    className="text-lg font-bold"
                  />
                </div>
                <div className="flex items-center justify-between p-4 rounded-2xl bg-muted/20 border border-border/40">
                  <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                    CLP / Chile
                  </span>
                  <Money
                    amount={15000}
                    currency="CLP"
                    locale="es-CL"
                    className="text-lg font-bold"
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card/40 backdrop-blur-xl border-border/50 rounded-[2rem] overflow-hidden shadow-sm">
              <CardHeader className="bg-muted/5 border-b border-border/10 pb-6">
                <CardTitle className="font-heading text-xl">
                  Date Display
                </CardTitle>
                <CardDescription>
                  Temporal formatting using standard locales.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-8 space-y-6">
                <div className="flex items-center justify-between p-4 rounded-2xl bg-muted/20 border border-border/40">
                  <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                    Short Format
                  </span>
                  <DateDisplay date={new Date()} className="font-medium" />
                </div>
                <div className="flex items-center justify-between p-4 rounded-2xl bg-muted/20 border border-border/40">
                  <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                    Long Format
                  </span>
                  <DateDisplay
                    date={new Date()}
                    format="long"
                    className="font-medium"
                  />
                </div>
                <div className="flex items-center justify-between p-4 rounded-2xl bg-muted/20 border border-border/40">
                  <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                    Relative (Today)
                  </span>
                  <DateDisplay
                    date={new Date()}
                    format="relative"
                    className="font-bold text-primary"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent
          value="logic"
          className="space-y-8 animate-in fade-in-50 duration-500"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="bg-card/40 backdrop-blur-xl border-border/50 rounded-[2rem] overflow-hidden shadow-sm">
              <CardHeader className="bg-muted/5 border-b border-border/10 pb-6">
                <CardTitle className="font-heading text-xl">
                  Visibility Toggle
                </CardTitle>
                <CardDescription>
                  Handle entity discoverability states.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-8">
                <div className="p-6 rounded-3xl bg-background/50 border border-border/40 shadow-inner">
                  <VisibilityToggle
                    value={visibility}
                    onChange={setVisibility}
                  />
                  <div className="mt-6 flex items-center gap-3">
                    <div className="size-2 rounded-full bg-primary animate-pulse" />
                    <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                      Current state:{" "}
                      <span className="text-primary">{visibility}</span>
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card/40 backdrop-blur-xl border-border/50 rounded-[2rem] overflow-hidden shadow-sm">
              <CardHeader className="bg-muted/5 border-b border-border/10 pb-6">
                <CardTitle className="font-heading text-xl">
                  Role Gate
                </CardTitle>
                <CardDescription>
                  Permission-based component mounting.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-8 space-y-6">
                <div className="p-5 border-2 border-dashed rounded-3xl bg-muted/10 space-y-3">
                  <div className="flex items-center gap-2 text-[10px] font-black uppercase text-muted-foreground/50 tracking-[0.2em] mb-1">
                    <Sparkles className="size-3" /> Admin Viewport
                  </div>
                  <RoleGate
                    role="ADMIN"
                    fallback={
                      <div className="flex items-center gap-2 text-destructive font-bold text-sm">
                        <div className="size-1.5 rounded-full bg-destructive" />
                        Access Restricted
                      </div>
                    }
                  >
                    <p className="text-emerald-500 font-bold text-sm flex items-center gap-2">
                      <div className="size-1.5 rounded-full bg-emerald-500" />
                      Root Access Granted
                    </p>
                  </RoleGate>
                </div>

                <div className="p-5 border-2 border-dashed rounded-3xl bg-muted/10 space-y-3">
                  <div className="flex items-center gap-2 text-[10px] font-black uppercase text-muted-foreground/50 tracking-[0.2em] mb-1">
                    <Sparkles className="size-3" /> Creator Viewport
                  </div>
                  <RoleGate
                    role="CREATOR"
                    fallback={
                      <div className="flex items-center gap-2 text-orange-500 font-bold text-sm">
                        <div className="size-1.5 rounded-full bg-orange-500" />
                        Creator Profile Required
                      </div>
                    }
                  >
                    <p className="text-primary font-bold text-sm flex items-center gap-2">
                      <div className="size-1.5 rounded-full bg-primary" />
                      Creator Tools Active
                    </p>
                  </RoleGate>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent
          value="layouts"
          className="space-y-8 animate-in fade-in-50 duration-500"
        >
          <Card className="bg-card/40 backdrop-blur-xl border-border/50 rounded-[2rem] overflow-hidden shadow-sm">
            <CardHeader className="bg-muted/5 border-b border-border/10 pb-6">
              <CardTitle className="font-heading text-xl">
                Empty States
              </CardTitle>
              <CardDescription>
                Placeholders for empty collections and null results.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-10 grid grid-cols-1 lg:grid-cols-2 gap-10">
              <div className="space-y-4">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/60 text-center">
                  Search Variant
                </p>
                <div className="border border-border/40 rounded-[2.5rem] bg-background/30 p-8">
                  <EmptyState
                    title="No components found"
                    description="We couldn't find any components matching your search criteria."
                    icon={Search}
                    action={{
                      label: "Clear Search",
                      onClick: () => console.log("Clear search"),
                    }}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/60 text-center">
                  Library Variant
                </p>
                <div className="border border-border/40 rounded-[2.5rem] bg-background/30 p-8">
                  <EmptyState
                    title="Your library is empty"
                    description="You haven't purchased any components yet. Explore the marketplace to get started."
                    icon={Package}
                    action={{
                      label: "Explore Marketplace",
                      href: "/market",
                    }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
