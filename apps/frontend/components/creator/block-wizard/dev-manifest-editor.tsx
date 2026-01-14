import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { Code2, Info } from "lucide-react";
import * as React from "react";
import { FiCpu, FiPackage, FiSettings } from "react-icons/fi";
import { toast } from "sonner";
import type { components } from "@/types/api";

interface DevManifestEditorProps {
  jsonInput: string;
  handleJsonChange: (value: string) => void;
  jsonError: string | null;
  categories: components["schemas"]["Category"][] | undefined;
  categoriesLoading: boolean;
  blockId: string | null;
  jobStatus: string | null;
  bundleUploaded: boolean;
}

export function DevManifestEditor({
  jsonInput,
  handleJsonChange,
  jsonError,
  categories,
  categoriesLoading,
  blockId,
  jobStatus,
  bundleUploaded,
}: DevManifestEditorProps) {
  return (
    <div className="mb-10 space-y-4 animate-in fade-in slide-in-from-top-4 duration-500">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-primary font-bold text-sm uppercase tracking-widest">
          <Code2 className="size-4" />
          JSON Manifest
        </div>
        <div className="flex items-center gap-2">
          {jsonError && (
            <Badge variant="destructive" className="animate-pulse text-[10px] py-0 h-5">
              Invalid: {jsonError}
            </Badge>
          )}
          <Button
            variant="outline"
            size="sm"
            className="h-8 rounded-lg text-[10px] font-bold uppercase tracking-wider"
            onClick={() => {
              navigator.clipboard.writeText(jsonInput);
              toast.success("Manifest copied to clipboard");
            }}
          >
            Copy JSON
          </Button>
        </div>
      </div>
      <Textarea
        value={jsonInput}
        onChange={(e) => handleJsonChange(e.target.value)}
        className={cn(
          "font-mono text-xs min-h-[250px] bg-background/80 rounded-2xl p-6 shadow-inner leading-relaxed transition-all",
          jsonError
            ? "border-destructive/50 focus:border-destructive"
            : "border-primary/20 focus:border-primary/50"
        )}
        placeholder='{ "title": "My Awesome Block", ... }'
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-muted/30 border border-border/40 space-y-3">
          <h4 className="text-[10px] font-bold uppercase tracking-widest text-primary flex items-center gap-2">
            <FiPackage className="size-3" />
            Available Category IDs
          </h4>
          <div className="max-h-[120px] overflow-y-auto space-y-1.5 pr-2 custom-scrollbar">
            {categoriesLoading ? (
              <p className="text-[10px] animate-pulse">Loading categories...</p>
            ) : (
              categories?.map((cat) => (
                <div
                  key={cat.id}
                  className="flex items-center justify-between text-[10px] font-mono group/id"
                >
                  <span className="text-muted-foreground">{cat.name}:</span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(cat.id);
                      toast.success(`ID for ${cat.name} copied`);
                    }}
                    className="bg-background/50 hover:bg-primary/10 px-2 py-0.5 rounded border border-border/40 transition-colors group-hover/id:border-primary/30"
                  >
                    {cat.id}
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-muted/30 border border-border/40 space-y-3">
          <h4 className="text-[10px] font-bold uppercase tracking-widest text-primary flex items-center gap-2">
            <FiSettings className="size-3" />
            Enum Constraints
          </h4>
          <div className="space-y-2 text-[9px] font-medium leading-tight text-muted-foreground">
            <div>
              <span className="text-foreground font-bold">type:</span> COMPONENT, SECTION, PAGE
            </div>
            <div>
              <span className="text-foreground font-bold">framework:</span> REACT, VUE, SVELTE
            </div>
            <div>
              <span className="text-foreground font-bold">stylingEngine:</span> TAILWIND, CSS
            </div>
            <div>
              <span className="text-foreground font-bold">visibility:</span> PUBLIC, PRIVATE, UNLISTED
            </div>
            <div>
              <span className="text-foreground font-bold">currency:</span> USD, EUR, CLP, GBP, MXN, ARS, BRL
            </div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10 space-y-3">
          <h4 className="text-[10px] font-bold uppercase tracking-widest text-primary flex items-center gap-2">
            <FiCpu className="size-3" />
            System State (Read-only)
          </h4>
          <div className="space-y-2 text-[9px] font-mono leading-tight">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Block ID:</span>
              <span className="text-foreground truncate ml-2">{blockId || "N/A"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Status:</span>
              <span
                className={cn(
                  "font-bold",
                  jobStatus === "SUCCEEDED"
                    ? "text-emerald-500"
                    : jobStatus === "FAILED"
                    ? "text-destructive"
                    : "text-amber-500"
                )}
              >
                {jobStatus || "DRAFT"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Bundle:</span>
              <span className="text-foreground">{bundleUploaded ? "READY" : "MISSING"}</span>
            </div>
          </div>
        </div>
      </div>

      <p className="text-[10px] text-muted-foreground font-medium flex items-center gap-2">
        <Info className="size-3" />
        Changes to the JSON will immediately manifest in the visual forge below. Validation active.
      </p>
    </div>
  );
}
