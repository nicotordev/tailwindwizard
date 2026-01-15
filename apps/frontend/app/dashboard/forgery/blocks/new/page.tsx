import type { ReactElement } from "react";
import { BlockWizard } from "@/components/creator/block-wizard";

export default function NewBlockPage(): ReactElement {
  return (
    <main className="min-h-screen">
      <div className="mb-10 space-y-2">
        <h1 className="text-4xl font-black font-heading tracking-tight">
          Create New <span className="text-primary italic">Block</span>
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl font-medium">
          Follow the forge sequence to manifest your component in the marketplace.
          You can write code directly or upload a bundle.
        </p>
      </div>
      <BlockWizard />
    </main>
  );
}
