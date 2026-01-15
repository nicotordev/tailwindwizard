"use client";

import { CollectionList } from "@/components/dashboard/collections/collection-list";
import { Badge } from "@/components/ui/badge";
import { Layers } from "lucide-react";

export default function CreatorCollectionsPage() {
  return (
    <div className="space-y-8 container mx-auto px-4 py-8">
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <Badge
            variant="secondary"
            className="rounded-full bg-primary/10 text-primary border-none"
          >
            <Layers className="size-3 mr-1" />
            Creator Bundles
          </Badge>
        </div>
        <h1 className="text-4xl font-bold font-heading tracking-tight">
          Your <span className="text-primary italic">Collections</span> 📦
        </h1>
        <p className="text-muted-foreground max-w-2xl text-lg">
          Create bundles of blocks to showcase or sell them together. Manage your
          public and private component stacks.
        </p>
      </div>

      <CollectionList />
    </div>
  );
}