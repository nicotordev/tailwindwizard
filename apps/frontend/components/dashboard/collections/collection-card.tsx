import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Collection } from "@/types/extended";
import { Folder, MoreHorizontal, Lock, Globe, EyeOff } from "lucide-react";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState } from "react";
import { EditCollectionDialog } from "./edit-collection-dialog";

interface CollectionCardProps {
  collection: Collection;
  onDelete?: (id: string) => void;
}

export function CollectionCard({ collection, onDelete }: CollectionCardProps) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const Icon = collection.visibility === "PUBLIC" ? Globe : collection.visibility === "UNLISTED" ? EyeOff : Lock;

  return (
    <>
      <Card className="group relative overflow-hidden transition-all hover:border-primary/50 hover:shadow-md">
        <Link href={`/dashboard/collections/${collection.id}`} className="absolute inset-0 z-10" />
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Folder className="h-5 w-5" />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative z-20 -mr-2 -mt-2 h-8 w-8 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100"
                >
                  <MoreHorizontal className="h-4 w-4" />
                  <span className="sr-only">Actions</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuItem 
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsEditOpen(true);
                  }}
                >
                  Edit
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete?.(collection.id);
                  }}
                >
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <CardTitle className="line-clamp-1 text-lg">{collection.name}</CardTitle>
          <CardDescription className="line-clamp-2 min-h-[2.5rem]">
            {collection.description || "No description provided."}
          </CardDescription>
        </CardHeader>
        <CardFooter className="flex items-center justify-between border-t bg-muted/20 px-6 py-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Icon className="h-3.5 w-3.5" />
            <span className="capitalize">{collection.visibility.toLowerCase()}</span>
          </div>
          <Badge variant="secondary" className="text-xs">
            {collection._count?.blocks ?? 0} blocks
          </Badge>
        </CardFooter>
      </Card>
      
      <EditCollectionDialog 
        collection={collection} 
        open={isEditOpen} 
        onOpenChange={setIsEditOpen} 
      />
    </>
  );
}
