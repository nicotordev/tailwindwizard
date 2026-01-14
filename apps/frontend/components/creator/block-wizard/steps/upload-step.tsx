import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { CloudUpload } from "lucide-react";
import * as React from "react";
import { frontendApi } from "@/lib/frontend-api";
import { toast } from "sonner";

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
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="rounded-[3rem] border-2 border-dashed border-border/60 bg-muted/10 p-16 text-center group hover:border-primary/40 hover:bg-primary/5 transition-all duration-500 cursor-pointer">
        <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-[2.5rem] bg-background border border-border/60 text-primary shadow-xl group-hover:scale-110 transition-transform duration-500">
          <CloudUpload className="size-10" />
        </div>
        <div className="mt-8 space-y-3">
          <p className="text-2xl font-heading tracking-tight">Sacrifice your code bundle</p>
          <p className="text-muted-foreground font-medium max-w-sm mx-auto">
            Drop your .zip or .tar bundle containing the component sources and documentation.
          </p>
        </div>
        <div className="mt-10 flex flex-col items-center gap-5">
          <Input
            type="file"
            accept=".zip,.tar,.tar.gz"
            disabled={isUploadingBundle}
            onChange={async (event) => {
              const file = event.target.files?.[0];
              if (!file) {
                setBundleName(null);
                setBundleUploaded(false);
                return;
              }

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
                toast.success("Bundle uploaded.");
              } catch (error) {
                console.error("Failed to upload bundle:", error);
                toast.error("Unable to upload the bundle right now.");
              } finally {
                setIsUploadingBundle(false);
              }
            }}
            className="max-w-xs cursor-pointer rounded-xl bg-background/60 h-auto p-2 border-border/40"
          />
          {bundleName && (
            <Badge
              variant="secondary"
              className="rounded-full px-5 py-2 bg-primary/10 text-primary border-none text-xs font-bold animate-in zoom-in-50"
            >
              {isUploadingBundle
                ? `Uploading ${bundleName}`
                : bundleUploaded
                ? `Uploaded ${bundleName}`
                : `Selected ${bundleName}`}
            </Badge>
          )}
        </div>
      </div>
      <div className="flex items-center gap-4 px-6 text-xs font-bold text-muted-foreground/60 uppercase tracking-widest justify-center">
        <div className="h-px flex-1 bg-border/40" />
        Security Protocol Active
        <div className="h-px flex-1 bg-border/40" />
      </div>
    </div>
  );
}
