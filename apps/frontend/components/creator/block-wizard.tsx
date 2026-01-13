"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useCategories } from "@/hooks/use-categories";
import { frontendApi } from "@/lib/frontend-api";
import { cn } from "@/lib/utils";
import { CreateBlockSchema } from "@tw/shared";
import StackIcon, { type IconName } from "tech-stack-icons";
import {
  VisibilityToggle,
  type Visibility,
} from "@/components/primitives/visibility-toggle";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  CheckCircle2,
  CloudUpload,
  FileCode2,
  Sparkles,
  Wand2,
  Info,
  XCircle,
  Code2,
  Terminal,
} from "lucide-react";
import { 
  FiPackage, 
  FiSettings, 
  FiCheck, 
  FiLink, 
  FiGrid, 
  FiLayers, 
  FiFileText, 
  FiTriangle, 
  FiCpu, 
  FiWind, 
  FiShield 
} from "react-icons/fi"
import type { IconType } from "react-icons/lib";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Spinner } from "@/components/ui/spinner";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

type WizardStep = "metadata" | "pricing" | "upload" | "preview" | "submit";

type BlockDraft = {
  title: string;
  slug: string;
  description: string;
  tags: string;
  categoryId: string;
  type: "COMPONENT" | "SECTION" | "PAGE";
  price: string;
  currency: "USD" | "EUR" | "CLP" | "GBP" | "MXN" | "ARS" | "BRL";
  license: "PERSONAL" | "TEAM" | "ENTERPRISE";
  framework: "REACT" | "VUE" | "SVELTE";
  stylingEngine: "TAILWIND" | "CSS";
  visibility: Visibility;
};

const steps: Array<{
  id: WizardStep;
  title: string;
  description: string;
  icon: typeof Sparkles;
}> = [
  {
    id: "metadata",
    title: "Metadata",
    description: "Name, describe, and classify your block.",
    icon: Sparkles,
  },
  {
    id: "pricing",
    title: "Pricing",
    description: "Set value and licensing for buyers.",
    icon: Wand2,
  },
  {
    id: "upload",
    title: "Code Upload",
    description: "Drop the bundle that powers the block.",
    icon: FileCode2,
  },
  {
    id: "preview",
    title: "Preview",
    description: "Queue a render for the gallery.",
    icon: CloudUpload,
  },
  {
    id: "submit",
    title: "Submit",
    description: "Review and send for moderation.",
    icon: CheckCircle2,
  },
];

const frameworkOptions: Record<
  BlockDraft["framework"],
  { label: string; stack?: IconName; icon?: IconType }
> = {
  REACT: { label: "React", stack: "react" },
  VUE: { label: "Vue", stack: "vuejs" },
  SVELTE: { label: "Svelte", icon: FiTriangle },
};

const stylingOptions: Record<
  BlockDraft["stylingEngine"],
  { label: string; stack?: IconName; icon?: IconType }
> = {
  TAILWIND: { label: "Tailwind", stack: "tailwindcss" },
  CSS: { label: "CSS", stack: "css3" },
};

const toSlug = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");

export function BlockWizard() {
  const router = useRouter();
  const { data: categories, isLoading: categoriesLoading } = useCategories();

  const [activeStep, setActiveStep] = React.useState(0);
  const [maxStepReached, setMaxStepReached] = React.useState(0);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isDraftCreating, setIsDraftCreating] = React.useState(false);
  const [slugTouched, setSlugTouched] = React.useState(false);
  const [blockId, setBlockId] = React.useState<string | null>(null);
  const [bundleName, setBundleName] = React.useState<string | null>(null);
  const [bundleUploaded, setBundleUploaded] = React.useState(false);
  const [isUploadingBundle, setIsUploadingBundle] = React.useState(false);
  const [previewQueued, setPreviewQueued] = React.useState(false);
  const [previewJobId, setPreviewJobId] = React.useState<string | null>(null);
  const [jobStatus, setJobStatus] = React.useState<"QUEUED" | "RUNNING" | "SUCCEEDED" | "FAILED" | null>(null);
  const [jobError, setJobError] = React.useState<string | null>(null);
  const [isPreviewing, setIsPreviewing] = React.useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [previews, setPreviews] = React.useState<any[]>([]);

  const [isDevMode, setIsDevMode] = React.useState(false);
  const [jsonInput, setJsonInput] = React.useState("");
  const [jsonError, setJsonError] = React.useState<string | null>(null);
  const isUpdatingFromJson = React.useRef(false);

  // Polling logic for render jobs
  React.useEffect(() => {
    let pollInterval: NodeJS.Timeout;

    if (previewJobId && (jobStatus === "QUEUED" || jobStatus === "RUNNING")) {
      pollInterval = setInterval(async () => {
        try {
          const { data } = await frontendApi.render.status(previewJobId);
          setJobStatus(data.status as any);
          if (data.status === "SUCCEEDED") {
            toast.success("Preview rendered successfully!");
            clearInterval(pollInterval);
            
            if (blockId) {
                try {
                    // Re-fetch block to get the generated previews
                    const blockRes = await frontendApi.blocks.identifier(blockId);
                    if (blockRes.data.previews) {
                        setPreviews(blockRes.data.previews);
                    }
                } catch (err) {
                    console.error("Failed to fetch previews:", err);
                }
            }

          } else if (data.status === "FAILED") {
            setJobError(data.error || "Unknown rendering error.");
            toast.error("Preview rendering failed.");
            clearInterval(pollInterval);
          }
        } catch (error) {
          console.error("Polling error:", error);
        }
      }, 3000);
    }

    return () => {
      if (pollInterval) clearInterval(pollInterval);
    };
  }, [previewJobId, jobStatus, blockId]);
  const [draft, setDraft] = React.useState<BlockDraft>({
    title: "",
    slug: "",
    description: "",
    tags: "",
    categoryId: "",
    type: "COMPONENT",
    price: "",
    currency: "USD",
    license: "PERSONAL",
    framework: "REACT",
    stylingEngine: "TAILWIND",
    visibility: "PRIVATE",
  });

  // Sync draft to JSON when dev mode is enabled or draft changes
  React.useEffect(() => {
    if (isDevMode && !isUpdatingFromJson.current) {
      setJsonInput(JSON.stringify(draft, null, 2));
    }
  }, [draft, isDevMode]);

  const handleJsonChange = (value: string) => {
    setJsonInput(value);
    try {
      const parsed = JSON.parse(value);
      // Basic validation to ensure we don't break the state
      if (typeof parsed === "object" && parsed !== null) {
        // Create a copy for validation as the schema expects specific types
        const toValidate = {
          ...parsed,
          price: typeof parsed.price === "string" ? Number(parsed.price) : parsed.price,
          tags: typeof parsed.tags === "string" ? parsed.tags.split(",").map((t: string) => t.trim()).filter(Boolean) : parsed.tags,
        };

        const result = CreateBlockSchema.partial().safeParse(toValidate);
        
        if (!result.success) {
          const errorMsg = result.error.errors.map(e => `${e.path.join(".")}: ${e.message}`).join(", ");
          setJsonError(errorMsg);
          return;
        }

        // Validate categoryId exists if provided
        if (parsed.categoryId && categories) {
          const exists = categories.some(c => c.id === parsed.categoryId);
          if (!exists) {
            setJsonError(`categoryId "${parsed.categoryId}" does not exist in the database.`);
            return;
          }
        }

        isUpdatingFromJson.current = true;
        // Ensure numeric price from JSON is converted back to string for the form state
        if (typeof parsed.price === "number") {
          parsed.price = String(parsed.price);
        }
        // Ensure tags array is converted back to string for the form state
        if (Array.isArray(parsed.tags)) {
          parsed.tags = parsed.tags.join(", ");
        }

        setDraft((prev) => ({ ...prev, ...parsed }));
        setJsonError(null);
        
        // Reset the ref after a tick to allow the effect to run for other changes
        setTimeout(() => {
          isUpdatingFromJson.current = false;
        }, 0);
      }
    } catch (e) {
      setJsonError((e as Error).message);
    }
  };

  React.useEffect(() => {
    setMaxStepReached((prev) => Math.max(prev, activeStep));
  }, [activeStep]);

  const step = steps[activeStep];
  const StepIcon = step.icon;
  const progressValue = ((activeStep + 1) / steps.length) * 100;

  const currentFramework = frameworkOptions[draft.framework];
  const currentStyling = stylingOptions[draft.stylingEngine];
  const FrameworkIcon = currentFramework.icon;
  const StylingIcon = currentStyling.icon;

  const setField = <K extends keyof BlockDraft>(
    key: K,
    value: BlockDraft[K]
  ) => {
    setDraft((prev) => ({ ...prev, [key]: value }));
  };

  const updateTitle = (value: string) => {
    setDraft((prev) => ({
      ...prev,
      title: value,
      slug: slugTouched ? prev.slug : toSlug(value),
    }));
  };

  const buildPayload = () => ({
    title: draft.title.trim(),
    slug: draft.slug.trim(),
    description: draft.description.trim() || undefined,
    type: draft.type,
    price: Number(draft.price),
    currency: draft.currency,
    framework: draft.framework,
    stylingEngine: draft.stylingEngine,
    visibility: draft.visibility,
    categoryId: draft.categoryId || undefined,
    tags: draft.tags
      ? draft.tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean)
      : undefined,
  });

  const ensureDraft = async () => {
    if (blockId) return blockId;

    setIsDraftCreating(true);
    try {
      const payload = buildPayload();
      const response = await frontendApi.blocks.create(payload);
      setBlockId(response.data.id);
      toast.success("Draft created. Upload your bundle next.");
      return response.data.id;
    } catch (error) {
      console.error("Failed to create block draft:", error);
      toast.error("Unable to start the draft right now.");
      return null;
    } finally {
      setIsDraftCreating(false);
    }
  };

  const goToStep = async (index: number) => {
    if (index <= activeStep) {
      setActiveStep(index);
      return;
    }

    const needsDraft = ["upload", "preview", "submit"].includes(
      steps[index]?.id ?? ""
    );

    if (needsDraft) {
      const id = await ensureDraft();
      if (!id) return;
    }

    setActiveStep(index);
  };

  const canContinue = React.useMemo(() => {
    if (step.id === "metadata") {
      return draft.title.trim().length > 2 && draft.slug.trim().length > 2;
    }
    if (step.id === "pricing") {
      return Number(draft.price) > 0;
    }
    if (step.id === "upload") {
      return bundleUploaded;
    }
    if (step.id === "preview") {
      return jobStatus === "SUCCEEDED";
    }
    return true;
  }, [
    bundleUploaded,
    draft.price,
    draft.slug,
    draft.title,
    previewQueued,
    step.id,
  ]);

  const isStepLocked = (index: number) => {
    // Can always go to previous steps
    if (index <= activeStep) return false;
    // Can go to steps already reached
    if (index <= maxStepReached) return false;
    // Can go to the immediate next step only if current is valid
    if (index === activeStep + 1) return !canContinue;
    // Everything else is locked
    return true;
  };

  const handleSubmit = async () => {
    const id = blockId ?? (await ensureDraft());
    if (!id) return;

    setIsSubmitting(true);
    try {
      const payload = buildPayload();
      await frontendApi.blocks.update(id, payload);
      const response = await frontendApi.blocks.submit(id);
      toast.success("Block submitted for review.");
      router.push(`/dashboard/blocks/${response.data.id}`);
    } catch (error) {
      console.error("Failed to submit block:", error);
      toast.error("Unable to submit the block right now.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="grid gap-10 lg:grid-cols-[300px_1fr]">
      <Card className="bg-card/30 backdrop-blur-2xl border-border/40 rounded-[2.5rem] h-fit sticky top-8 shadow-2xl shadow-primary/5">
        <CardHeader className="space-y-6 p-8 pb-4">
          <div className="space-y-3">
            <Badge
              variant="secondary"
              className={cn(
                "w-fit border-none transition-colors",
                isDevMode 
                  ? "bg-amber-500/10 text-amber-500 hover:bg-amber-500/20" 
                  : "bg-primary/10 text-primary hover:bg-primary/20"
              )}
            >
              {isDevMode ? "Developer Suite" : "Creation Suite"}
            </Badge>
            <CardTitle className="text-3xl font-heading tracking-tight">
              {isDevMode ? "Direct Manifest" : "Forge Sequence"}
            </CardTitle>
            <CardDescription className="text-sm leading-relaxed">
              {isDevMode 
                ? "Manipulate the raw essence of your block directly via JSON."
                : "Step through the ritual to publish your next digital spell."}
            </CardDescription>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-[10px] uppercase tracking-widest font-bold text-muted-foreground/70">
              <span>Completion</span>
              <span>{Math.round(progressValue)}%</span>
            </div>
            <Progress value={progressValue} className="h-1.5 bg-primary/5" />
          </div>
        </CardHeader>
        <CardContent className="space-y-3 p-6">
          {steps.map((item, index) => {
            const Icon = item.icon;
            const isActive = index === activeStep;
            const isCompleted = index < activeStep;
            const isLocked = isStepLocked(index);

            return (
              <button
                key={item.id}
                type="button"
                disabled={isLocked}
                onClick={() => void goToStep(index)}
                className={cn(
                  "w-full text-left rounded-[1.25rem] px-4 py-4 transition-all duration-300 group",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-[1.02]"
                    : isLocked
                    ? "opacity-40 cursor-not-allowed filter grayscale"
                    : "hover:bg-muted/40 text-muted-foreground"
                )}
              >
                <div className="flex items-center gap-4">
                  <div
                    className={cn(
                      "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors",
                      isActive
                        ? "bg-white/20 text-white"
                        : isCompleted
                        ? "bg-primary/10 text-primary"
                        : "bg-muted/50 text-muted-foreground group-hover:bg-muted"
                    )}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="size-5" />
                    ) : (
                      <Icon className="size-5" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p
                      className={cn(
                        "text-sm font-bold tracking-tight leading-none",
                        isActive ? "text-white" : "text-foreground"
                      )}
                    >
                      {item.title}
                    </p>
                    <p
                      className={cn(
                        "text-[11px] mt-1.5 truncate opacity-70",
                        isActive ? "text-white/80" : "text-muted-foreground"
                      )}
                    >
                      {isLocked ? "Complete previous steps" : item.description}
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </CardContent>
      </Card>

      <div className="space-y-8">
        <Card className="bg-card/30 backdrop-blur-2xl border-border/40 rounded-[2.5rem] overflow-hidden shadow-2xl shadow-primary/5">
          <CardHeader className="p-10 pb-8 border-b border-border/40 bg-gradient-to-br from-primary/5 via-transparent to-transparent">
            <div className="flex flex-wrap items-center justify-between gap-6">
              <div className="flex items-center gap-5">
                <div className="flex h-16 w-16 items-center justify-center rounded-[1.5rem] bg-background border border-border/60 text-primary shadow-inner shadow-primary/5">
                  <StepIcon className="size-7" />
                </div>
                <div className="space-y-1.5">
                  <CardTitle className="text-3xl font-heading tracking-tight">
                    {step.title}
                  </CardTitle>
                  <CardDescription className="text-base">
                    {step.description}
                  </CardDescription>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="flex items-center gap-3 px-4 py-2 rounded-2xl bg-primary/5 border border-primary/10">
                  <div className="flex items-center gap-2">
                    <Terminal className="size-4 text-primary" />
                    <Label htmlFor="dev-mode" className="text-xs font-bold uppercase tracking-wider cursor-pointer">Dev Mode</Label>
                  </div>
                  <Switch 
                    id="dev-mode" 
                    checked={isDevMode} 
                    onCheckedChange={setIsDevMode}
                  />
                </div>
                
                <Badge
                  variant="outline"
                  className="rounded-full px-5 py-2 border-border/60 bg-background/50 text-xs font-bold tracking-wider uppercase"
                >
                  Phase {activeStep + 1}{" "}
                  <span className="mx-2 opacity-30">/</span> {steps.length}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-10">
            {isDevMode && (
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
                    jsonError ? "border-destructive/50 focus:border-destructive" : "border-primary/20 focus:border-primary/50"
                  )}
                  placeholder='{ "title": "My Awesome Block", ... }'
                />
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 rounded-2xl bg-muted/30 border border-border/40 space-y-3">
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-primary flex items-center gap-2">
                      <FiPackage className="size-3" />
                      Available Category IDs
                    </h4>
                    {/* ... existing categories content ... */}
                    <div className="max-h-[120px] overflow-y-auto space-y-1.5 pr-2 custom-scrollbar">
                      {categoriesLoading ? (
                        <p className="text-[10px] animate-pulse">Loading categories...</p>
                      ) : (
                        categories?.map((cat) => (
                          <div key={cat.id} className="flex items-center justify-between text-[10px] font-mono group/id">
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
                      <div><span className="text-foreground font-bold">type:</span> COMPONENT, SECTION, PAGE</div>
                      <div><span className="text-foreground font-bold">framework:</span> REACT, VUE, SVELTE</div>
                      <div><span className="text-foreground font-bold">stylingEngine:</span> TAILWIND, CSS</div>
                      <div><span className="text-foreground font-bold">visibility:</span> PUBLIC, PRIVATE, UNLISTED</div>
                      <div><span className="text-foreground font-bold">currency:</span> USD, EUR, CLP, GBP, MXN, ARS, BRL</div>
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
                        <span className={cn(
                          "font-bold",
                          jobStatus === "SUCCEEDED" ? "text-emerald-500" : 
                          jobStatus === "FAILED" ? "text-destructive" : "text-amber-500"
                        )}>{jobStatus || "DRAFT"}</span>
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
            )}

            {step.id === "metadata" && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="grid gap-8 lg:grid-cols-2">
                  <div className="space-y-3">
                    <label className="text-sm font-bold tracking-tight text-foreground/80">
                      Title
                    </label>
                    <Input
                      value={draft.title}
                      onChange={(event) => updateTitle(event.target.value)}
                      placeholder="e.g. Neo-Glass Dashboard Sidebar"
                      className="h-14 rounded-2xl bg-background/40 border-border/60 focus:bg-background/80 transition-all text-base px-5"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-sm font-bold tracking-tight text-foreground/80">
                      Slug
                    </label>
                    <div className="space-y-3">
                      <Input
                        value={draft.slug}
                        onChange={(event) => {
                          setSlugTouched(true);
                          setField("slug", event.target.value);
                        }}
                        placeholder="neo-glass-sidebar"
                        className="h-14 rounded-2xl bg-background/40 border-border/60 focus:bg-background/80 transition-all font-mono text-sm px-5"
                      />
                      <div className="flex items-center gap-2 px-1 text-xs font-medium text-muted-foreground bg-muted/30 w-fit py-1.5 px-3 rounded-lg">
                        <FiLink className="size-3 text-primary" />
                        tailwindwizard.com/blocks/{draft.slug || "..."}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-bold tracking-tight text-foreground/80">
                    Description
                  </label>
                  <Textarea
                    value={draft.description}
                    onChange={(event) =>
                      setField("description", event.target.value)
                    }
                    placeholder="Describe the magical properties of your component..."
                    className="min-h-[160px] rounded-2xl bg-background/40 border-border/60 focus:bg-background/80 transition-all text-base p-5 leading-relaxed"
                  />
                </div>

                <div className="flex items-stretch gap-8">
                  <div className="space-y-3">
                    <label className="text-sm font-bold tracking-tight text-foreground/80">
                      Tags
                    </label>
                    <Input
                      value={draft.tags}
                      onChange={(event) => setField("tags", event.target.value)}
                      placeholder="navigation, glassmorphism, saas"
                      className="h-14 rounded-2xl bg-background/40 border-border/60 focus:bg-background/80 transition-all text-base px-5"
                    />
                    <p className="text-xs font-medium text-muted-foreground/70 px-1">
                      Press comma to separate tags. Keywords help buyers find
                      your work.
                    </p>
                  </div>
                  <div className="space-y-3">
                    <label className="text-sm font-bold tracking-tight text-foreground/80">
                      Category
                    </label>
                    <Select
                      value={draft.categoryId}
                      onValueChange={(value) => setField("categoryId", value)}
                      disabled={categoriesLoading}
                    >
                      <SelectTrigger className="h-14 rounded-2xl bg-background/40 border-border/60 focus:bg-background/80 transition-all text-base px-5">
                        <SelectValue
                          placeholder={
                            categoriesLoading
                              ? "Summoning categories..."
                              : "Select the best fit"
                          }
                        />
                      </SelectTrigger>
                      <SelectContent className="rounded-2xl border-border/40 shadow-2xl">
                        {(categories || []).map((category) => (
                          <SelectItem
                            key={category.id}
                            value={category.id}
                            className="rounded-xl my-1 mx-1 focus:bg-primary/10"
                          >
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex items-stretch gap-8">
                  <div className="space-y-3">
                    <label className="text-sm font-bold tracking-tight text-foreground/80">
                      Type
                    </label>
                    <Select
                      value={draft.type}
                      onValueChange={(value) =>
                        setField("type", value as BlockDraft["type"])
                      }
                    >
                      <SelectTrigger className="h-14 rounded-2xl bg-background/40 border-border/60 focus:bg-background/80 transition-all text-base px-5">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-2xl border-border/40">
                        <SelectItem
                          value="COMPONENT"
                          className="rounded-xl my-1 mx-1"
                        >
                          <div className="flex items-center gap-3">
                            <FiGrid className="size-4 text-primary" />
                            Component
                          </div>
                        </SelectItem>
                        <SelectItem
                          value="SECTION"
                          className="rounded-xl my-1 mx-1"
                        >
                          <div className="flex items-center gap-3">
                            <FiLayers className="size-4 text-primary" />
                            Section
                          </div>
                        </SelectItem>
                        <SelectItem
                          value="PAGE"
                          className="rounded-xl my-1 mx-1"
                        >
                          <div className="flex items-center gap-3">
                            <FiFileText className="size-4 text-primary" />
                            Page
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-3">
                    <label className="text-sm font-bold tracking-tight text-foreground/80">
                      Framework
                    </label>
                    <Select
                      value={draft.framework}
                      onValueChange={(value) =>
                        setField("framework", value as BlockDraft["framework"])
                      }
                    >
                      <SelectTrigger className="h-14 rounded-2xl bg-background/40 border-border/60 focus:bg-background/80 transition-all text-base px-5">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-2xl border-border/40">
                        <SelectItem
                          value="REACT"
                          className="rounded-xl my-1 mx-1"
                        >
                          <div className="flex items-center gap-3">
                            <StackIcon name="react" className="h-5 w-5" />
                            React
                          </div>
                        </SelectItem>
                        <SelectItem
                          value="VUE"
                          className="rounded-xl my-1 mx-1"
                        >
                          <div className="flex items-center gap-3">
                            <StackIcon name="vuejs" className="h-5 w-5" />
                            Vue
                          </div>
                        </SelectItem>
                        <SelectItem
                          value="SVELTE"
                          className="rounded-xl my-1 mx-1"
                        >
                          <div className="flex items-center gap-3">
                            <FiTriangle className="size-4 text-primary" />
                            Svelte
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-3">
                    <label className="text-sm font-bold tracking-tight text-foreground/80">
                      Styling
                    </label>
                    <Select
                      value={draft.stylingEngine}
                      onValueChange={(value) =>
                        setField(
                          "stylingEngine",
                          value as BlockDraft["stylingEngine"]
                        )
                      }
                    >
                      <SelectTrigger className="h-14 rounded-2xl bg-background/40 border-border/60 focus:bg-background/80 transition-all text-base px-5">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-2xl border-border/40">
                        <SelectItem
                          value="TAILWIND"
                          className="rounded-xl my-1 mx-1"
                        >
                          <div className="flex items-center gap-3">
                            <StackIcon name="tailwindcss" className="h-5 w-5" />
                            Tailwind
                          </div>
                        </SelectItem>
                        <SelectItem
                          value="CSS"
                          className="rounded-xl my-1 mx-1"
                        >
                          <div className="flex items-center gap-3">
                            <StackIcon name="css3" className="h-5 w-5" />
                            CSS
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-sm font-bold tracking-tight text-foreground/80">
                    Visibility
                  </label>
                  <div className="flex flex-wrap items-center gap-6 p-6 rounded-3xl bg-primary/5 border border-primary/10">
                    <VisibilityToggle
                      value={draft.visibility}
                      onChange={(value) => setField("visibility", value)}
                      className="rounded-xl shadow-sm"
                    />
                    <p className="text-sm font-medium text-muted-foreground/80 max-w-sm leading-relaxed">
                      Control who can witness this creation while it remains in
                      draft or review status.
                    </p>
                  </div>
                </div>

                <div className="rounded-3xl border border-border/40 bg-muted/20 p-8 space-y-4">
                  <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60">
                    Manifestation Preview
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <Badge
                      variant="secondary"
                      className="rounded-full px-5 py-2 bg-background border border-border/60 shadow-sm text-xs font-bold flex items-center gap-2"
                    >
                      {draft.type === "COMPONENT" && (
                        <FiGrid
                          className="size-3.5 text-primary"
                          aria-label="Component type"
                        />
                      )}
                      {draft.type === "SECTION" && (
                        <FiLayers
                          className="size-3.5 text-primary"
                          aria-label="Section type"
                        />
                      )}
                      {draft.type === "PAGE" && (
                        <FiFileText
                          className="size-3.5 text-primary"
                          aria-label="Page type"
                        />
                      )}
                      {draft.type.toLowerCase()}
                    </Badge>
                    <Badge
                      variant="secondary"
                      className="rounded-full px-5 py-2 bg-background border border-border/60 shadow-sm text-xs font-bold flex items-center gap-2"
                    >
                      {currentFramework.stack ? (
                        <StackIcon
                          name={currentFramework.stack}
                          className="size-3.5"
                          aria-label={`${currentFramework.label} framework`}
                        />
                      ) : FrameworkIcon ? (
                        <FrameworkIcon
                          className="size-3.5 text-primary"
                          aria-label={`${currentFramework.label} framework`}
                        />
                      ) : (
                        <FiCpu
                          className="size-3.5 text-primary"
                          aria-label="Framework"
                        />
                      )}
                      {currentFramework.label}
                    </Badge>
                    <Badge
                      variant="secondary"
                      className="rounded-full px-5 py-2 bg-background border border-border/60 shadow-sm text-xs font-bold flex items-center gap-2"
                    >
                      {currentStyling.stack ? (
                        <StackIcon
                          name={currentStyling.stack}
                          className="size-3.5"
                          aria-label={`${currentStyling.label} styling engine`}
                        />
                      ) : StylingIcon ? (
                        <StylingIcon
                          className="size-3.5 text-primary"
                          aria-label={`${currentStyling.label} styling engine`}
                        />
                      ) : (
                        <FiWind
                          className="size-3.5 text-primary"
                          aria-label="Styling engine"
                        />
                      )}
                      {currentStyling.label}
                    </Badge>
                  </div>
                </div>
              </div>
            )}

            {step.id === "pricing" && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="grid gap-8 lg:grid-cols-3">
                  <div className="space-y-3">
                    <label className="text-sm font-bold tracking-tight text-foreground/80">
                      Price
                    </label>
                    <div className="relative group">
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={draft.price}
                        onChange={(event) =>
                          setField("price", event.target.value)
                        }
                        placeholder="0.00"
                        className="h-14 rounded-2xl bg-background/40 border-border/60 focus:bg-background/80 transition-all text-xl font-heading px-5"
                      />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <label className="text-sm font-bold tracking-tight text-foreground/80">
                      Currency
                    </label>
                    <Select
                      value={draft.currency}
                      onValueChange={(value) =>
                        setField("currency", value as BlockDraft["currency"])
                      }
                    >
                      <SelectTrigger className="h-14 rounded-2xl bg-background/40 border-border/60 focus:bg-background/80 transition-all text-base px-5">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-2xl">
                        {["USD", "EUR", "CLP", "GBP", "MXN", "ARS", "BRL"].map(
                          (c) => (
                            <SelectItem
                              key={c}
                              value={c}
                              className="rounded-xl my-1 mx-1"
                            >
                              {c}
                            </SelectItem>
                          )
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-3">
                    <label className="text-sm font-bold tracking-tight text-foreground/80">
                      License Tier
                    </label>
                    <Select
                      value={draft.license}
                      onValueChange={(value) =>
                        setField("license", value as BlockDraft["license"])
                      }
                    >
                      <SelectTrigger className="h-14 rounded-2xl bg-background/40 border-border/60 focus:bg-background/80 transition-all text-base px-5">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-2xl">
                        {["PERSONAL", "TEAM", "ENTERPRISE"].map((l) => (
                          <SelectItem
                            key={l}
                            value={l}
                            className="rounded-xl my-1 mx-1"
                          >
                            <div className="flex items-center gap-3">
                              <FiShield className="size-4 text-primary" />
                              {l.charAt(0) + l.slice(1).toLowerCase()}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="rounded-3xl border border-dashed border-primary/20 bg-primary/5 p-8 flex items-start gap-5">
                  <div className="h-10 w-10 shrink-0 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <Sparkles className="size-5" />
                  </div>
                  <div className="space-y-1.5">
                    <div className="text-sm font-bold text-primary">
                      Creator Note
                    </div>
                    <p className="text-sm font-medium text-muted-foreground leading-relaxed">
                      The final license configuration will be verified during
                      review. Ensure your pricing reflects the value of the
                      components and their intended audience.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {step.id === "upload" && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="rounded-[3rem] border-2 border-dashed border-border/60 bg-muted/10 p-16 text-center group hover:border-primary/40 hover:bg-primary/5 transition-all duration-500 cursor-pointer">
                  <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-[2.5rem] bg-background border border-border/60 text-primary shadow-xl group-hover:scale-110 transition-transform duration-500">
                    <CloudUpload className="size-10" />
                  </div>
                  <div className="mt-8 space-y-3">
                    <p className="text-2xl font-heading tracking-tight">
                      Sacrifice your code bundle
                    </p>
                    <p className="text-muted-foreground font-medium max-w-sm mx-auto">
                      Drop your .zip or .tar bundle containing the component
                      sources and documentation.
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

                        const id = blockId ?? (await ensureDraft());
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
            )}

            {step.id === "preview" && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="rounded-[3rem] border border-border/40 bg-muted/10 p-10">
                  <div className="flex items-start gap-6">
                    <div className="h-16 w-16 shrink-0 rounded-[1.5rem] bg-primary/10 flex items-center justify-center text-primary">
                      <Wand2 className="size-8" />
                    </div>
                    <div className="space-y-3">
                      <p className="text-2xl font-heading tracking-tight">
                        Render Sanctum
                      </p>
                      <p className="text-muted-foreground font-medium leading-relaxed">
                        Preview assets are procedurally generated from your
                        bundle to showcase your spell in the marketplace
                        gallery.
                      </p>
                    </div>
                  </div>

                  <Accordion type="single" collapsible className="mt-8 border border-border/40 rounded-3xl bg-background/40 overflow-hidden">
                    <AccordionItem value="guide" className="border-none">
                      <AccordionTrigger className="px-6 py-4 hover:no-underline group">
                        <div className="flex items-center gap-3 text-primary">
                          <Info className="size-4" />
                          <span className="font-bold tracking-tight">Preview System Compatibility Guide</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-6 pb-6 text-muted-foreground leading-relaxed space-y-4">
                        <p className="text-sm">
                          To ensure your components render correctly, our previewer runs your code in a sandboxed environment using Babel Standalone.
                        </p>
                        
                        <div className="space-y-2">
                          <h4 className="text-xs font-bold uppercase tracking-widest text-foreground">Supported Dependencies</h4>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div className="p-2 rounded-lg bg-muted/30 border border-border/40">React 18.2.0</div>
                            <div className="p-2 rounded-lg bg-muted/30 border border-border/40">Lucide React 0.294.0</div>
                            <div className="p-2 rounded-lg bg-muted/30 border border-border/40">Framer Motion 10.16.4</div>
                            <div className="p-2 rounded-lg bg-muted/30 border border-border/40">Tailwind Merge & Clsx</div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <h4 className="text-xs font-bold uppercase tracking-widest text-foreground">Core Rules</h4>
                          <ul className="list-disc list-inside text-xs space-y-1 ml-1">
                            <li><strong>Default Export:</strong> Your component must be a default export.</li>
                            <li><strong>Single File:</strong> Relative imports are not yet supported in sandbox.</li>
                            <li><strong>No Node APIs:</strong> Avoid <code className="bg-muted px-1 rounded">fs</code>, <code className="bg-muted px-1 rounded">path</code>, etc.</li>
                            <li><strong>Standard Tags:</strong> Use <code className="bg-muted px-1 rounded">&lt;img&gt;</code> and <code className="bg-muted px-1 rounded">&lt;a&gt;</code> instead of Next.js components.</li>
                          </ul>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>

                  <div className="mt-10 flex flex-wrap items-center gap-4">
                    <Button
                      onClick={async () => {
                        const id = blockId ?? (await ensureDraft());
                        if (!id) return;

                        setIsPreviewing(true);
                        setJobError(null);
                        try {
                          const response =
                            await frontendApi.blocks.queuePreview(id);
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
                                    <div key={preview.id} className="relative rounded-2xl overflow-hidden border border-border/40 bg-muted/20 aspect-video group/preview shadow-sm">
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
            )}

            {step.id === "submit" && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="rounded-[3rem] border border-border/40 bg-muted/10 p-10 overflow-hidden relative">
                  <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
                    <CheckCircle2 className="size-64" />
                  </div>
                  <p className="text-2xl font-heading tracking-tight mb-8">
                    Final Manifestation
                  </p>
                  <div className="grid gap-4">
                    {[
                      { label: "Title", value: draft.title || "Untitled" },
                      {
                        label: "Identity",
                        value: draft.slug || "-",
                        mono: true,
                      },
                      {
                        label: "Value",
                        value: draft.price
                          ? `${draft.currency} ${draft.price}`
                          : "Free Transfer",
                      },
                      { label: "Exposure", value: draft.visibility },
                    ].map((item, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between p-5 rounded-2xl bg-background/40 border border-border/40"
                      >
                        <span className="text-sm font-bold text-muted-foreground uppercase tracking-widest">
                          {item.label}
                        </span>
                        <span
                          className={cn(
                            "font-bold text-foreground",
                            item.mono && "font-mono text-sm opacity-80"
                          )}
                        >
                          {item.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div className="flex flex-wrap items-center justify-between gap-6 border-t border-border/40 mt-12 pt-10">
              <Button
                variant="ghost"
                size="lg"
                className="rounded-2xl h-14 px-8 font-bold text-muted-foreground hover:bg-muted/50"
                onClick={() => setActiveStep((prev) => Math.max(0, prev - 1))}
                disabled={activeStep === 0}
              >
                Retreat
              </Button>
              <div className="flex items-center gap-4">
                {step.id !== "submit" ? (
                  <Button
                    size="lg"
                    className="rounded-2xl h-14 px-10 font-bold text-base shadow-xl shadow-primary/20 group"
                    onClick={() =>
                      void goToStep(Math.min(steps.length - 1, activeStep + 1))
                    }
                    disabled={!canContinue || isDraftCreating}
                  >
                    Proceed Sequence
                  </Button>
                ) : (
                  <Button
                    size="lg"
                    className="rounded-2xl h-14 px-10 font-bold text-base shadow-xl shadow-primary/20"
                    onClick={handleSubmit}
                    disabled={isSubmitting || !canContinue}
                  >
                    {isSubmitting ? "Casting..." : "Finalize Forge"}
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="px-10 flex items-center justify-between text-[11px] font-bold text-muted-foreground/40 uppercase tracking-[0.2em]">
          <span>TailwindWizard Protocol v2.0</span>
          <span>Draft State • Encrypted</span>
        </div>
      </div>
    </div>
  );
}
