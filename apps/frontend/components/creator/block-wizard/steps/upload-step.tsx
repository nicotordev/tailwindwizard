import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CloudUpload, Code2 } from "lucide-react";
import * as React from "react";
import { frontendApi } from "@/lib/frontend-api";
import { toast } from "sonner";
import dynamic from "next/dynamic";

// Dynamically import PlaygroundClient to avoid SSR issues with Sandpack
const PlaygroundClient = dynamic(
  () => import("@/components/creator/playground/playground"),
  { ssr: false }
);

interface UploadStepProps {
  isUploadingBundle: boolean;
  setIsUploadingBundle: (value: boolean) => void;
  bundleName: string | null;
  setBundleName: (value: string | null) => void;
  bundleUploaded: boolean;
  setBundleUploaded: (value: boolean) => void;
  setPreviewQueued: (value: boolean) => void;
  setPreviewJobId: (value: string | null) => void;
  blockId: string | null;
  ensureDraft: () => Promise<string | null>;
}

export function UploadStep({
  isUploadingBundle,
  setIsUploadingBundle,
  bundleName,
  setBundleName,
  bundleUploaded,
  setBundleUploaded,
  setPreviewQueued,
  setPreviewJobId,
  blockId,
  ensureDraft,
}: UploadStepProps) {
  const [mode, setMode] = React.useState<"upload" | "editor">("upload");

  const handleFile = async (file: File) => {
    if (!file) return;

    setBundleName(file.name);
    setBundleUploaded(false);
    setPreviewQueued(false);
    setPreviewJobId(null);

    const id = await ensureDraft();
    if (!id) return;

    const formData = new FormData();
    formData.append("bundle", file);

    setIsUploadingBundle(true);
    try {
      await frontendApi.blocks.uploadBundle(id, formData);
      setBundleUploaded(true);
      toast.success("Bundle uploaded successfully.");
      // If coming from editor, maybe switch back or show success state
      if (mode === "editor") {
        setMode("upload");
      }
    } catch (error) {
      console.error("Failed to upload bundle:", error);
      toast.error("Unable to upload the bundle right now.");
    } finally {
      setIsUploadingBundle(false);
    }
  };

  if (mode === "editor") {
    return (
      <div className="space-y-4 animate-in fade-in zoom-in-95 duration-300">
        <PlaygroundClient
          onClose={() => setMode("upload")}
          onSave={handleFile}
        />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Option 1: File Upload */}
        <div className="rounded-[2.5rem] border-2 border-dashed border-border/60 bg-muted/10 p-10 text-center group hover:border-primary/40 hover:bg-primary/5 transition-all duration-500 cursor-pointer relative overflow-hidden">
          <Input
            type="file"
            accept=".zip,.tar,.tar.gz"
            disabled={isUploadingBundle}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
            }}
            className="absolute inset-0 opacity-0 cursor-pointer z-10"
          />
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[2rem] bg-background border border-border/60 text-primary shadow-xl group-hover:scale-110 transition-transform duration-500">
            <CloudUpload className="size-8" />
          </div>
          <div className="mt-6 space-y-2">
            <p className="text-xl font-heading tracking-tight">Upload Bundle</p>
            <p className="text-sm text-muted-foreground font-medium">
              Drop your .zip archive
            </p>
          </div>
        </div>

        {/* Option 2: Web Editor */}
        <div
          onClick={() => setMode("editor")}
          className="rounded-[2.5rem] border-2 border-dashed border-border/60 bg-muted/10 p-10 text-center group hover:border-primary/40 hover:bg-primary/5 transition-all duration-500 cursor-pointer"
        >
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[2rem] bg-background border border-border/60 text-indigo-500 shadow-xl group-hover:scale-110 transition-transform duration-500">
            <Code2 className="size-8" />
          </div>
          <div className="mt-6 space-y-2">
            <p className="text-xl font-heading tracking-tight">Open Forge</p>
            <p className="text-sm text-muted-foreground font-medium">
              Code directly in browser
            </p>
          </div>
        </div>
      </div>

      {/* Status Indicator */}
      {(isUploadingBundle || bundleUploaded) && (
        <div className="flex justify-center animate-in fade-in slide-in-from-bottom-2">
          <Badge
            variant="secondary"
            className="rounded-full px-6 py-2.5 bg-primary/10 text-primary border-none text-sm font-bold shadow-sm"
          >
            {isUploadingBundle ? (
              <span className="flex items-center gap-2">
                <CloudUpload className="size-4 animate-bounce" />
                Uploading {bundleName}...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Code2 className="size-4" />
                {bundleName} Active
              </span>
            )}
          </Badge>
        </div>
      )}

      <div className="flex items-center gap-4 px-6 text-xs font-bold text-muted-foreground/60 uppercase tracking-widest justify-center">
        <div className="h-px flex-1 bg-border/40" />
        Security Protocol Active
        <div className="h-px flex-1 bg-border/40" />
      </div>
    </div>
  );
}