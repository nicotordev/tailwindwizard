"use client";

import { CollectionCard } from "./collection-card";
import { Button } from "@/components/ui/button";
import { Plus, Loader2, FolderPlus } from "lucide-react";
import { useState } from "react";
import { CreateCollectionDialog } from "./create-collection-dialog";
import { toast } from "sonner";
import { useCollections } from "@/hooks/use-collections";

export function CollectionList() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const { data: collections, isLoading, error, deleteCollection } = useCollections();

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-4 text-center">
        <p className="text-muted-foreground">Failed to load collections.</p>
        <Button variant="outline" onClick={() => window.location.reload()}>
          Retry
        </Button>
      </div>
    );
  }

  if (!collections || collections.length === 0) {
    return (
      <div className="flex h-96 flex-col items-center justify-center gap-6 rounded-[2rem] border border-dashed bg-muted/10 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted/50">
          <FolderPlus className="h-10 w-10 text-muted-foreground" />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-bold font-heading">No collections yet</h3>
          <p className="text-muted-foreground max-w-sm mx-auto">
            Create a collection to organize your favorite blocks and components.
          </p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Create Collection
        </Button>
        <CreateCollectionDialog open={isCreateOpen} onOpenChange={setIsCreateOpen} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold font-heading tracking-tight">All Collections</h2>
        <Button onClick={() => setIsCreateOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          New Collection
        </Button>
      </div>
      
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {collections.map((collection) => (
          <CollectionCard
            key={collection.id}
            collection={collection}
            onDelete={(id) => {
              if (confirm("Are you sure you want to delete this collection?")) {
                deleteCollection.mutate(id, {
                  onSuccess: () => toast.success("Collection deleted"),
                  onError: () => toast.error("Failed to delete collection"),
                });
              }
            }}
          />
        ))}
      </div>
      
      <CreateCollectionDialog open={isCreateOpen} onOpenChange={setIsCreateOpen} />
    </div>
  );
}
