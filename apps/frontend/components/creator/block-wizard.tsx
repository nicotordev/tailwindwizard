"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useCategories } from "@/hooks/use-categories";
import { frontendApi } from "@/lib/frontend-api";
import { cn } from "@/lib/utils";
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
  const [isPreviewing, setIsPreviewing] = React.useState(false);
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
      return previewQueued;
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
              className="w-fit bg-primary/10 text-primary border-none hover:bg-primary/20 transition-colors"
            >
              Creation Suite
            </Badge>
            <CardTitle className="text-3xl font-heading tracking-tight">
              Forge Sequence
            </CardTitle>
            <CardDescription className="text-sm leading-relaxed">
              Step through the ritual to publish your next digital spell.
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
              <Badge
                variant="outline"
                className="rounded-full px-5 py-2 border-border/60 bg-background/50 text-xs font-bold tracking-wider uppercase"
              >
                Phase {activeStep + 1}{" "}
                <span className="mx-2 opacity-30">/</span> {steps.length}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-10">
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
                  <div className="mt-10 flex flex-wrap items-center gap-4">
                    <Button
                      onClick={async () => {
                        const id = blockId ?? (await ensureDraft());
                        if (!id) return;

                        setIsPreviewing(true);
                        try {
                          const response =
                            await frontendApi.blocks.queuePreview(id);
                          setPreviewQueued(true);
                          setPreviewJobId(response.data.id);
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
                      disabled={!bundleUploaded || isPreviewing}
                    >
                      {isPreviewing
                        ? "Queuing Render..."
                        : previewQueued
                        ? "Render Engaged"
                        : "Summon Preview"}
                    </Button>
                    {previewQueued && (
                      <div className="flex items-center gap-3 text-sm font-bold text-primary animate-pulse bg-primary/5 px-5 py-3 rounded-2xl">
                        Estimated Ritual: 2-4 minutes
                        {previewJobId ? ` (job ${previewJobId.slice(-6)})` : ""}
                      </div>
                    )}
                  </div>
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
