"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FolderPlus, Plus, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { CreateCollectionDialog } from "./create-collection-dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useCollections } from "@/hooks/use-collections";

interface AddToCollectionDialogProps {
  blockId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddToCollectionDialog({
  blockId,
  open,
  onOpenChange,
}: AddToCollectionDialogProps) {
  const [createOpen, setCreateOpen] = useState(false);
  const { data: collections, isLoading, addBlock } = useCollections();

  if (!blockId) return null;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Add to Collection</DialogTitle>
            <DialogDescription>
              Save this block to one of your collections.
            </DialogDescription>
          </DialogHeader>

          <div className="mt-2">
            {isLoading ? (
              <div className="flex h-32 items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : !collections || collections.length === 0 ? (
              <div className="flex h-32 flex-col items-center justify-center gap-2 text-center">
                <p className="text-sm text-muted-foreground">
                  You don&apos;t have any collections yet.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCreateOpen(true)}
                >
                  Create Collection
                </Button>
              </div>
            ) : (
              <ScrollArea className="h-[240px] pr-4">
                <div className="space-y-2">
                  {collections.map((collection) => (
                    <button
                      key={collection.id}
                      className={cn(
                        "flex w-full items-center justify-between rounded-lg border p-3 text-left transition-colors hover:bg-muted/50"
                      )}
                      onClick={() =>
                        addBlock.mutate(
                          {
                            collectionId: collection.id,
                            blockId,
                          },
                          {
                            onSuccess: () => {
                              toast.success("Added to collection");
                              onOpenChange(false);
                            },
                            onError: (err) => {
                              toast.error("Failed to add to collection");
                            },
                          }
                        )
                      }
                      disabled={addBlock.isPending}
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded bg-primary/10 text-primary">
                          <FolderPlus className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-sm font-medium leading-none">
                            {collection.name}
                          </p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {collection._count?.blocks ?? 0} items
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </ScrollArea>
            )}

            <Button
              variant="ghost"
              className="mt-4 w-full justify-start gap-2 text-muted-foreground"
              onClick={() => setCreateOpen(true)}
            >
              <Plus className="h-4 w-4" />
              Create new collection
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <CreateCollectionDialog open={createOpen} onOpenChange={setCreateOpen} />
    </>
  );
}
