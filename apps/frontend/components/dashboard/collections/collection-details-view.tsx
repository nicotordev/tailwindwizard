"use client";

import { Block, Collection } from "@/types/extended";
import { Loader2, Trash2, ArrowLeft, MoreVertical, Pencil } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { BlockCard } from "@/components/marketplace/block-card";
import { useState } from "react";
import { EditCollectionDialog } from "./edit-collection-dialog";
import { useCollectionDetails } from "@/hooks/use-collection-details";
import { useCollections } from "@/hooks/use-collections";

interface CollectionDetailsViewProps {
  collectionId: string;
}

export function CollectionDetailsView({
  collectionId,
}: CollectionDetailsViewProps) {
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(false);

  const { data: collection, isLoading, error } =
    useCollectionDetails(collectionId);
  const { removeBlock, deleteCollection } = useCollections();

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !collection) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20">
        <p className="text-muted-foreground">Collection not found.</p>
        <Button variant="outline" asChild>
          <Link href="/dashboard/collections">Back to Collections</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-6 border-b pb-8">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            asChild
            className="-ml-2 text-muted-foreground"
          >
            <Link href="/dashboard/collections">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Collections
            </Link>
          </Button>
        </div>

        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold font-heading">
                {collection.name}
              </h1>
              <Badge variant="outline" className="capitalize">
                {collection.visibility.toLowerCase()}
              </Badge>
            </div>
            {collection.description && (
              <p className="text-muted-foreground max-w-2xl">
                {collection.description}
              </p>
            )}
            <div className="text-sm text-muted-foreground/60">
              {collection.blocks?.length || 0} items • Updated{" "}
              {new Date(collection.updatedAt).toLocaleDateString()}
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setEditOpen(true)}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit Details
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => {
                  if (
                    confirm("Delete this collection? This cannot be undone.")
                  ) {
                    deleteCollection.mutate(collection.id, {
                      onSuccess: () => {
                        toast.success("Collection deleted");
                        router.push("/dashboard/collections");
                      },
                      onError: () => {
                        toast.error("Failed to delete collection");
                      },
                    });
                  }
                }}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Collection
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <EditCollectionDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        collection={collection}
      />

      {/* Blocks Grid */}
      {!collection.blocks || collection.blocks.length === 0 ? (
        <div className="flex h-64 flex-col items-center justify-center gap-4 rounded-2xl border border-dashed bg-muted/5 text-center">
          <p className="text-muted-foreground">This collection is empty.</p>
          <Button asChild>
            <Link href="/market">Browse Marketplace</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {collection.blocks.map((item) => (
            <div key={item.block.id} className="group relative">
              <BlockCard block={item.block} />
              <Button
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2 z-30 h-8 w-8 opacity-0 transition-opacity group-hover:opacity-100 shadow-sm"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  removeBlock.mutate(
                    { collectionId: collection.id, blockId: item.block.id },
                    {
                      onSuccess: () =>
                        toast.success("Block removed from collection"),
                      onError: () => toast.error("Failed to remove block"),
                    }
                  );
                }}
                title="Remove from collection"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}