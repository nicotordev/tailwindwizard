import { Metadata } from "next"
import { BlockWizard } from "@/components/creator/block-wizard"
import { Badge } from "@/components/ui/badge"

export const metadata: Metadata = {
  title: "Create Block | TailwindWizard",
  description: "Publish a new Tailwind block to the marketplace.",
}

export default function NewBlockPage() {
  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <Badge variant="secondary">Creator Workflow</Badge>
        <h1 className="text-4xl font-heading font-bold tracking-tight">
          Create a new block
        </h1>
        <p className="text-muted-foreground max-w-2xl">
          Walk through the five-step forge to prepare your component for review.
        </p>
      </div>
      <BlockWizard />
    </div>
  )
}
