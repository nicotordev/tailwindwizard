import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { CheckCircle2, Info, Wand2, XCircle } from "lucide-react";
import * as React from "react";
import { frontendApi } from "@/lib/frontend-api";
import { toast } from "sonner";
import type { PreviewAsset } from "../types";

interface PreviewStepProps {
  blockId: string | null;
  ensureDraft: () => Promise<string | null>;
  isPreviewing: boolean;
  setIsPreviewing: (value: boolean) => void;
  setJobError: (value: string | null) => void;
  setPreviewQueued: (value: boolean) => void;
  setPreviewJobId: (value: string | null) => void;
  setJobStatus: (value: any) => void;
  previewQueued: boolean;
  jobStatus: string | null;
  bundleUploaded: boolean;
  previews: PreviewAsset[];
  jobError: string | null;
}

export function PreviewStep({
  blockId,
  ensureDraft,
  isPreviewing,
  setIsPreviewing,
  setJobError,
  setPreviewQueued,
  setPreviewJobId,
  setJobStatus,
  previewQueued,
  jobStatus,
  bundleUploaded,
  previews,
  jobError,
}: PreviewStepProps) {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="rounded-[3rem] border border-border/40 bg-muted/10 p-10">
        <div className="flex items-start gap-6">
          <div className="h-16 w-16 shrink-0 rounded-[1.5rem] bg-primary/10 flex items-center justify-center text-primary">
            <Wand2 className="size-8" />
          </div>
          <div className="space-y-3">
            <p className="text-2xl font-heading tracking-tight">Render Sanctum</p>
            <p className="text-muted-foreground font-medium leading-relaxed">
              Preview assets are procedurally generated from your bundle to showcase your spell in
              the marketplace gallery.
            </p>
          </div>
        </div>

        <Accordion
          type="single"
          collapsible
          className="mt-8 border border-border/40 rounded-3xl bg-background/40 overflow-hidden"
        >
          <AccordionItem value="guide" className="border-none">
            <AccordionTrigger className="px-6 py-4 hover:no-underline group">
              <div className="flex items-center gap-3 text-primary">
                <Info className="size-4" />
                <span className="font-bold tracking-tight">Preview System Compatibility Guide</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-6 text-muted-foreground leading-relaxed space-y-4">
              <p className="text-sm">
                To ensure your components render correctly, our previewer runs your code in a
                sandboxed environment using Babel Standalone.
              </p>

              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-widest text-foreground">
                  Supported Dependencies
                </h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2 rounded-lg bg-muted/30 border border-border/40">
                    React 18.2.0
                  </div>
                  <div className="p-2 rounded-lg bg-muted/30 border border-border/40">
                    Lucide React 0.294.0
                  </div>
                  <div className="p-2 rounded-lg bg-muted/30 border border-border/40">
                    Framer Motion 10.16.4
                  </div>
                  <div className="p-2 rounded-lg bg-muted/30 border border-border/40">
                    Tailwind Merge & Clsx
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-widest text-foreground">
                  Core Rules
                </h4>
                <ul className="list-disc list-inside text-xs space-y-1 ml-1">
                  <li>
                    <strong>Default Export:</strong> Your component must be a default export.
                  </li>
                  <li>
                    <strong>Single File:</strong> Relative imports are not yet supported in sandbox.
                  </li>
                  <li>
                    <strong>No Node APIs:</strong> Avoid{" "}
                    <code className="bg-muted px-1 rounded">fs</code>,{" "}
                    <code className="bg-muted px-1 rounded">path</code>, etc.
                  </li>
                  <li>
                    <strong>Standard Tags:</strong> Use{" "}
                    <code className="bg-muted px-1 rounded">&lt;img&gt;</code> and{" "}
                    <code className="bg-muted px-1 rounded">&lt;a&gt;</code> instead of Next.js
                    components.
                  </li>
                </ul>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <div className="mt-10 flex flex-wrap items-center gap-4">
          <Button
            onClick={async () => {
              const id = await ensureDraft();
              if (!id) return;

              setIsPreviewing(true);
              setJobError(null);
              try {
                const response = await frontendApi.blocks.queuePreview(id);
                setPreviewQueued(true);
                setPreviewJobId(response.data.id);
                setJobStatus("QUEUED");
                toast.success("Preview render queued.");
              } catch (error) {
                console.error("Failed to queue preview:", error);
                toast.error("Unable to queue the preview right now.");
              } finally {
                setIsPreviewing(false);
              }
            }}
            size="lg"
            className="rounded-2xl h-14 px-8 font-bold text-base shadow-lg shadow-primary/20"
            variant={previewQueued ? "secondary" : "default"}
            disabled={!bundleUploaded || isPreviewing || jobStatus === "RUNNING"}
          >
            {isPreviewing || jobStatus === "RUNNING"
              ? "Rendering..."
              : jobStatus === "SUCCEEDED"
              ? "Re-summon Preview"
              : "Summon Preview"}
          </Button>

          {jobStatus === "QUEUED" && (
            <div className="flex items-center gap-3 text-sm font-bold text-amber-500 bg-amber-500/5 px-5 py-3 rounded-2xl animate-pulse">
              <Spinner className="size-4" />
              In Queue...
            </div>
          )}

          {jobStatus === "RUNNING" && (
            <div className="flex items-center gap-3 text-sm font-bold text-primary bg-primary/5 px-5 py-3 rounded-2xl">
              <Spinner className="size-4" />
              Casting Spell (Rendering)...
            </div>
          )}

          {jobStatus === "SUCCEEDED" && (
            <div className="w-full mt-4 space-y-4">
              <div className="flex items-center gap-3 text-sm font-bold text-emerald-500 bg-emerald-500/5 px-5 py-3 rounded-2xl w-fit">
                <CheckCircle2 className="size-4" />
                Preview Manifested Successfully
              </div>

              {previews.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-in fade-in slide-in-from-bottom-4">
                  {previews.map((preview) => (
                    <div
                      key={preview.id}
                      className="relative rounded-2xl overflow-hidden border border-border/40 bg-muted/20 aspect-video group/preview shadow-sm"
                    >
                      <img
                        src={preview.url}
                        alt={`Preview ${preview.viewport}`}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover/preview:scale-105"
                      />
                      <div className="absolute bottom-3 right-3 px-2.5 py-1 bg-background/80 backdrop-blur-md text-foreground text-[10px] font-bold uppercase rounded-lg border border-border/20 shadow-sm">
                        {preview.viewport}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {jobStatus === "FAILED" && (
            <div className="flex items-center gap-3 text-sm font-bold text-destructive bg-destructive/5 px-5 py-3 rounded-2xl">
              <XCircle className="size-4" />
              Manifestation Failed
            </div>
          )}
        </div>

        {jobError && (
          <div className="mt-6 p-6 rounded-2xl bg-destructive/10 border border-destructive/20 space-y-2">
            <div className="flex items-center gap-2 text-destructive font-bold text-sm">
              <XCircle className="size-4" />
              Rendering Error
            </div>
            <pre className="text-xs font-mono text-destructive/80 whitespace-pre-wrap overflow-x-auto p-4 bg-background/50 rounded-xl">
              {jobError}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
