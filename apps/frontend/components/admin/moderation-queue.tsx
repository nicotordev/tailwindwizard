"use client"

import * as React from "react"
import type { Block } from "@/types/extended"
import { BlockStatusBadge, type BlockStatus } from "@/components/primitives/status-badges"
import { DateDisplay, Money } from "@/components/primitives/formatters"
import { EmptyState } from "@/components/primitives/empty-state"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import { frontendApi } from "@/lib/frontend-api"
import { toast } from "sonner"
import { Gavel, ShieldCheck, Eye, MessageSquareWarning } from "lucide-react"

interface ModerationQueueProps {
  initialBlocks: Block[]
}

export function ModerationQueue({ initialBlocks }: ModerationQueueProps) {
  const [queue, setQueue] = React.useState(initialBlocks)
  const [selected, setSelected] = React.useState<Block | null>(null)
  const [notes, setNotes] = React.useState("")
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [filter, setFilter] = React.useState("")

  const filteredQueue = queue.filter((block) => {
    if (!filter) return true
    return block.title.toLowerCase().includes(filter.toLowerCase())
  })

  const decide = async (blockId: string, decision: "APPROVE" | "REJECT" | "REQUEST_CHANGES") => {
    setIsSubmitting(true)
    try {
      await frontendApi.admin.decide(blockId, { decision, notes: notes || undefined })
      setQueue((prev) => prev.filter((block) => block.id !== blockId))
      toast.success(`Decision recorded: ${decision.toLowerCase().replace("_", " ")}`)
    } catch (error) {
      console.error("Moderation decision failed:", error)
      toast.error("Unable to submit moderation decision.")
    } finally {
      setIsSubmitting(false)
      setSelected(null)
      setNotes("")
    }
  }

  if (!queue.length) {
    return (
      <EmptyState
        title="Moderation queue is clear"
        description="No submitted blocks need review right now."
        icon={Gavel}
        variant="hero"
      />
    )
  }

  return (
    <Card className="bg-card/40 backdrop-blur-xl border-border/50 rounded-[2rem]">
      <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <CardTitle className="text-2xl font-heading">Moderation queue</CardTitle>
          <p className="text-sm text-muted-foreground">
            Review submitted blocks and issue decisions.
          </p>
        </div>
        <div className="w-full md:w-[260px]">
          <Input
            placeholder="Filter by title"
            value={filter}
            onChange={(event) => setFilter(event.target.value)}
            className="h-10 rounded-xl bg-background/60"
          />
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Block</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Submitted</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredQueue.map((block) => (
              <TableRow key={block.id} className="hover:bg-muted/20">
                <TableCell className="font-medium">
                  <div className="flex flex-col">
                    <span>{block.title}</span>
                    <span className="text-xs text-muted-foreground font-mono">
                      {block.slug}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <BlockStatusBadge status={block.status as BlockStatus} />
                </TableCell>
                <TableCell>
                  <Money amount={block.price} />
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  <DateDisplay date={block.updatedAt} format="relative" />
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="icon" className="rounded-lg" disabled>
                      <Eye className="size-4" />
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      className="rounded-xl"
                      onClick={() => decide(block.id, "APPROVE")}
                      disabled={isSubmitting}
                    >
                      <ShieldCheck className="size-4 mr-2" />
                      Approve
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-xl"
                      onClick={() => setSelected(block)}
                    >
                      <MessageSquareWarning className="size-4 mr-2" />
                      Reject
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>

      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="rounded-[2rem]">
          <DialogHeader>
            <DialogTitle>Send feedback</DialogTitle>
            <DialogDescription>
              Explain what needs to change before approving this block.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Share the changes required for approval..."
              className="min-h-[120px] rounded-xl"
            />
            <div className="flex flex-wrap justify-end gap-3">
              <Button
                variant="secondary"
                className="rounded-xl"
                onClick={() => selected && decide(selected.id, "REQUEST_CHANGES")}
                disabled={isSubmitting}
              >
                Request changes
              </Button>
              <Button
                variant="destructive"
                className="rounded-xl"
                onClick={() => selected && decide(selected.id, "REJECT")}
                disabled={isSubmitting}
              >
                Reject block
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
