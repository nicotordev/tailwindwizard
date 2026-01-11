"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { BlockStatusBadge, type BlockStatus } from "@/components/primitives/status-badges"
import { Money } from "@/components/primitives/formatters"
import { VisibilityToggle, type Visibility } from "@/components/primitives/visibility-toggle"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import type { Block } from "@/types/extended"
import { frontendApi } from "@/lib/frontend-api"
import {
  AlertTriangle,
  ArrowUpRight,
  BarChart3,
  CheckCircle2,
  FileText,
  Rocket,
  Sparkles,
} from "lucide-react"

type EditorState = {
  title: string
  slug: string
  description: string
  type: "COMPONENT" | "SECTION" | "PAGE"
  price: string
  currency: "USD" | "EUR" | "CLP" | "GBP" | "MXN" | "ARS" | "BRL"
  framework: "REACT" | "VUE" | "SVELTE"
  stylingEngine: "TAILWIND" | "CSS"
  visibility: Visibility
}

export function BlockDetailView({ block }: { block: Block }) {
  const status = block.status as BlockStatus

  return (
    <div className="space-y-8">
      <Card className="bg-card/40 backdrop-blur-xl border-border/50 rounded-[2rem]">
        <CardHeader className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <CardTitle className="text-3xl font-heading">{block.title}</CardTitle>
              <CardDescription className="font-mono text-xs mt-1">
                {block.slug}
              </CardDescription>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="secondary" className="rounded-full">
                {block.type}
              </Badge>
              <BlockStatusBadge status={status} />
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <StatCard label="Price" value={<Money amount={block.price} />} />
            <StatCard label="Sales" value={block.soldCount ?? 0} />
            <StatCard
              label="Rating"
              value={`${Number(block.ratingAvg || 0).toFixed(1)} (${block.ratingCount || 0})`}
            />
          </div>
        </CardHeader>
      </Card>

      {status === "DRAFT" && <BlockEditor block={block} />}
      {status === "REJECTED" && <RejectedPanel block={block} />}
      {status === "SUBMITTED" && <SubmittedPanel />}
      {status === "APPROVED" && <ApprovedPanel />}
      {status === "PUBLISHED" && <PublishedPanel block={block} />}

      {status !== "PUBLISHED" && status !== "SUBMITTED" && status !== "APPROVED" && (
        <Card className="bg-card/30 backdrop-blur-md border-border/40 rounded-[2rem]">
          <CardHeader>
            <CardTitle className="text-xl font-heading">Preview gallery</CardTitle>
            <CardDescription>
              Preview assets appear here once render jobs complete.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-2xl border border-dashed border-border/60 bg-muted/20 p-8 text-center text-sm text-muted-foreground">
              No preview assets yet.
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border/40 bg-muted/20 p-4">
      <p className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">
        {label}
      </p>
      <p className="mt-2 text-xl font-heading">{value}</p>
    </div>
  )
}

function BlockEditor({ block }: { block: Block }) {
  const router = useRouter()
  const [isSaving, setIsSaving] = React.useState(false)
  const [state, setState] = React.useState<EditorState>({
    title: block.title ?? "",
    slug: block.slug ?? "",
    description: block.description ?? "",
    type: block.type ?? "COMPONENT",
    price: String(block.price ?? ""),
    currency: block.currency ?? "USD",
    framework: block.framework ?? "REACT",
    stylingEngine: block.stylingEngine ?? "TAILWIND",
    visibility: (block.visibility ?? "PRIVATE") as Visibility,
  })

  const setField = <K extends keyof EditorState>(key: K, value: EditorState[K]) => {
    setState((prev) => ({ ...prev, [key]: value }))
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await frontendApi.blocks.update(block.id, {
        title: state.title.trim(),
        slug: state.slug.trim(),
        description: state.description.trim(),
        type: state.type,
        price: Number(state.price),
        currency: state.currency,
        framework: state.framework,
        stylingEngine: state.stylingEngine,
        visibility: state.visibility,
      })
      toast.success("Block updated.")
      router.refresh()
    } catch (error) {
      console.error("Failed to update block:", error)
      toast.error("Unable to save changes right now.")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Card className="bg-card/30 backdrop-blur-md border-border/40 rounded-[2rem]">
      <CardHeader className="space-y-2">
        <CardTitle className="text-xl font-heading">Edit draft</CardTitle>
        <CardDescription>
          Fine-tune the metadata before submitting for review.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium">Title</label>
            <Input
              value={state.title}
              onChange={(event) => setField("title", event.target.value)}
              className="h-11 rounded-xl bg-background/60"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Slug</label>
            <Input
              value={state.slug}
              onChange={(event) => setField("slug", event.target.value)}
              className="h-11 rounded-xl bg-background/60 font-mono text-xs"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Description</label>
          <Textarea
            value={state.description}
            onChange={(event) => setField("description", event.target.value)}
            className="min-h-[120px] rounded-xl bg-background/60"
          />
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <div className="space-y-2">
            <label className="text-sm font-medium">Type</label>
            <Select
              value={state.type}
              onValueChange={(value) => setField("type", value as EditorState["type"])}
            >
              <SelectTrigger className="h-11 rounded-xl bg-background/60">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="COMPONENT">Component</SelectItem>
                <SelectItem value="SECTION">Section</SelectItem>
                <SelectItem value="PAGE">Page</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Framework</label>
            <Select
              value={state.framework}
              onValueChange={(value) =>
                setField("framework", value as EditorState["framework"])
              }
            >
              <SelectTrigger className="h-11 rounded-xl bg-background/60">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="REACT">React</SelectItem>
                <SelectItem value="VUE">Vue</SelectItem>
                <SelectItem value="SVELTE">Svelte</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Styling</label>
            <Select
              value={state.stylingEngine}
              onValueChange={(value) =>
                setField(
                  "stylingEngine",
                  value as EditorState["stylingEngine"]
                )
              }
            >
              <SelectTrigger className="h-11 rounded-xl bg-background/60">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="TAILWIND">Tailwind</SelectItem>
                <SelectItem value="CSS">CSS</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <div className="space-y-2">
            <label className="text-sm font-medium">Price</label>
            <Input
              type="number"
              min="0"
              step="0.01"
              value={state.price}
              onChange={(event) => setField("price", event.target.value)}
              className="h-11 rounded-xl bg-background/60"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Currency</label>
            <Select
              value={state.currency}
              onValueChange={(value) =>
                setField("currency", value as EditorState["currency"])
              }
            >
              <SelectTrigger className="h-11 rounded-xl bg-background/60">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="USD">USD</SelectItem>
                <SelectItem value="EUR">EUR</SelectItem>
                <SelectItem value="CLP">CLP</SelectItem>
                <SelectItem value="GBP">GBP</SelectItem>
                <SelectItem value="MXN">MXN</SelectItem>
                <SelectItem value="ARS">ARS</SelectItem>
                <SelectItem value="BRL">BRL</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Visibility</label>
            <VisibilityToggle
              value={state.visibility}
              onChange={(value) => setField("visibility", value)}
              className="rounded-xl w-full justify-between"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/40 pt-4">
          <p className="text-xs text-muted-foreground">
            Submissions are queued once review endpoints are enabled.
          </p>
          <div className="flex items-center gap-3">
            <Button
              variant="secondary"
              className="rounded-xl"
              onClick={() => toast.message("Submission queue is coming soon.")}
            >
              Submit for review
            </Button>
            <Button
              className="rounded-xl"
              onClick={handleSave}
              disabled={isSaving}
            >
              {isSaving ? "Saving..." : "Save changes"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function RejectedPanel({ block }: { block: Block }) {
  return (
    <div className="space-y-6">
      <Card className="bg-destructive/5 border-destructive/30 rounded-[2rem]">
        <CardHeader className="space-y-2">
          <div className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="size-5" />
            <CardTitle className="text-xl font-heading">Needs revisions</CardTitle>
          </div>
          <CardDescription>
            The moderation team requested changes before publishing.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          <p>
            No detailed feedback is available yet. Update your block metadata and
            resubmit once the revision tools are enabled.
          </p>
        </CardContent>
      </Card>
      <BlockEditor block={block} />
    </div>
  )
}

function SubmittedPanel() {
  return (
    <Card className="bg-card/30 backdrop-blur-md border-border/40 rounded-[2rem]">
      <CardHeader>
        <CardTitle className="text-xl font-heading">Moderation status</CardTitle>
        <CardDescription>
          We are validating metadata, code safety, and preview assets.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <TimelineItem
          icon={CheckCircle2}
          title="Submission received"
          status="complete"
        />
        <TimelineItem
          icon={FileText}
          title="In review"
          status="active"
        />
        <TimelineItem
          icon={Rocket}
          title="Decision"
          status="pending"
        />
      </CardContent>
    </Card>
  )
}

function ApprovedPanel() {
  return (
    <Card className="bg-card/30 backdrop-blur-md border-border/40 rounded-[2rem]">
      <CardHeader className="space-y-2">
        <div className="flex items-center gap-2 text-emerald-500">
          <CheckCircle2 className="size-5" />
          <CardTitle className="text-xl font-heading">Approved to publish</CardTitle>
        </div>
        <CardDescription>
          Your block passed moderation. Publishing unlocks the marketplace listing.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-wrap items-center justify-between gap-4">
        <div className="rounded-2xl border border-border/40 bg-muted/20 p-4 text-sm text-muted-foreground">
          Make sure previews look correct and pricing is final before going live.
        </div>
        <Button
          className="rounded-xl gap-2"
          onClick={() => toast.message("Publishing tools are coming soon.")}
        >
          Publish now <ArrowUpRight className="size-4" />
        </Button>
      </CardContent>
    </Card>
  )
}

function PublishedPanel({ block }: { block: Block }) {
  const views = Math.max(block.soldCount || 0, 1) * 42

  return (
    <Card className="bg-card/30 backdrop-blur-md border-border/40 rounded-[2rem]">
      <CardHeader className="space-y-2">
        <CardTitle className="text-xl font-heading">Performance</CardTitle>
        <CardDescription>
          Live insights from the marketplace listing.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-3">
        <MetricCard
          icon={BarChart3}
          label="Views"
          value={views.toLocaleString()}
        />
        <MetricCard
          icon={Sparkles}
          label="Sales"
          value={block.soldCount?.toLocaleString() ?? "0"}
        />
        <MetricCard
          icon={CheckCircle2}
          label="Rating"
          value={`${Number(block.ratingAvg || 0).toFixed(1)}`}
        />
      </CardContent>
    </Card>
  )
}

function TimelineItem({
  icon: Icon,
  title,
  status,
}: {
  icon: typeof CheckCircle2
  title: string
  status: "complete" | "active" | "pending"
}) {
  const styles =
    status === "complete"
      ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-500"
      : status === "active"
      ? "border-primary/30 bg-primary/10 text-primary"
      : "border-border/40 bg-muted/20 text-muted-foreground"

  return (
    <div className="flex items-center gap-4 rounded-2xl border border-border/40 bg-muted/10 p-4">
      <div className={`flex h-10 w-10 items-center justify-center rounded-xl border ${styles}`}>
        <Icon className="size-4" />
      </div>
      <div>
        <p className="text-sm font-semibold">{title}</p>
        <p className="text-xs text-muted-foreground capitalize">{status}</p>
      </div>
    </div>
  )
}

function MetricCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof BarChart3
  label: string
  value: string
}) {
  return (
    <div className="rounded-2xl border border-border/40 bg-muted/10 p-4">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Icon className="size-4" />
        <span className="text-xs uppercase tracking-widest">{label}</span>
      </div>
      <p className="mt-3 text-2xl font-heading">{value}</p>
    </div>
  )
}
