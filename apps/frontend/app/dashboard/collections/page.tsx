import { Metadata } from "next";
import { CollectionList } from "@/components/dashboard/collections/collection-list";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "My Collections | TailwindWizard",
  description: "Manage your block collections.",
};

export default function CollectionsPage() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <Badge variant="secondary">My Collections</Badge>
        </div>
        <h1 className="text-4xl font-bold font-heading tracking-tight">
          Your <span className="text-primary italic">Stacks</span> 📚
        </h1>
        <p className="text-muted-foreground max-w-2xl text-lg">
          Group, organize, and share your blocks with custom collections.
        </p>
      </div>

      <CollectionList />
    </div>
  );
}
