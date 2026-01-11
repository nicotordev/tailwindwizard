"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useCategories } from "@/hooks/use-categories";
import { frontendApi } from "@/lib/frontend-api";
import { cn } from "@/lib/utils";
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
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [slugTouched, setSlugTouched] = React.useState(false);
  const [bundleName, setBundleName] = React.useState<string | null>(null);
  const [previewQueued, setPreviewQueued] = React.useState(false);
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

  const step = steps[activeStep];
  const progressValue = ((activeStep + 1) / steps.length) * 100;

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

  const canContinue = React.useMemo(() => {
    if (step.id === "metadata") {
      return draft.title.trim().length > 2 && draft.slug.trim().length > 2;
    }
    if (step.id === "pricing") {
      return Number(draft.price) > 0;
    }
    return true;
  }, [draft.price, draft.slug, draft.title, step.id]);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const payload = {
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
      };

      const response = await frontendApi.blocks.create(payload);
      toast.success("Block created. You can finish polishing it now.");
      router.push(`/dashboard/blocks/${response.data.id}`);
    } catch (error) {
      console.error("Failed to create block:", error);
      toast.error("Unable to create the block right now.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
      <Card className="bg-card/40 backdrop-blur-xl border-border/50 rounded-[2rem] h-fit">
        <CardHeader className="space-y-4">
          <div className="space-y-2">
            <Badge variant="secondary" className="w-fit">
              Create Block
            </Badge>
            <CardTitle className="text-2xl font-heading">
              Forge Sequence
            </CardTitle>
            <CardDescription>
              Follow the steps to publish your next spell.
            </CardDescription>
          </div>
          <Progress value={progressValue} className="h-2" />
        </CardHeader>
        <CardContent className="space-y-2">
          {steps.map((item, index) => {
            const Icon = item.icon;
            const isActive = index === activeStep;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveStep(index)}
                className={cn(
                  "w-full text-left rounded-2xl border px-4 py-3 transition-all",
                  isActive
                    ? "border-primary/40 bg-primary/10 text-primary"
                    : "border-border/40 bg-muted/20 text-muted-foreground hover:bg-muted/30"
                )}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-xl border",
                      isActive
                        ? "border-primary/40 bg-primary/10 text-primary"
                        : "border-border/40 bg-background text-muted-foreground"
                    )}
                  >
                    <Icon className="size-4" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{item.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </CardContent>
      </Card>

      <Card className="bg-card/40 backdrop-blur-xl border-border/50 rounded-[2rem] overflow-hidden">
        <CardHeader className="border-b border-border/40">
          <CardTitle className="text-2xl font-heading">{step.title}</CardTitle>
          <CardDescription>{step.description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 p-8">
          {step.id === "metadata" && (
            <div className="space-y-5">
              <div className="grid gap-4 lg:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Title</label>
                  <Input
                    value={draft.title}
                    onChange={(event) => updateTitle(event.target.value)}
                    placeholder="Floating navigation bar"
                    className="h-11 rounded-xl bg-background/60"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Slug</label>
                  <Input
                    value={draft.slug}
                    onChange={(event) => {
                      setSlugTouched(true);
                      setField("slug", event.target.value);
                    }}
                    placeholder="floating-navigation-bar"
                    className="h-11 rounded-xl bg-background/60 font-mono text-xs"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  value={draft.description}
                  onChange={(event) =>
                    setField("description", event.target.value)
                  }
                  placeholder="Describe the component and its best use cases."
                  className="min-h-[120px] rounded-xl bg-background/60"
                />
              </div>

              <div className="grid gap-4 lg:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Tags</label>
                  <Input
                    value={draft.tags}
                    onChange={(event) => setField("tags", event.target.value)}
                    placeholder="navigation, glassmorphism, SaaS"
                    className="h-11 rounded-xl bg-background/60"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Category</label>
                  <Select
                    value={draft.categoryId}
                    onValueChange={(value) => setField("categoryId", value)}
                    disabled={categoriesLoading}
                  >
                    <SelectTrigger className="h-11 rounded-xl bg-background/60">
                      <SelectValue
                        placeholder={
                          categoriesLoading ? "Loading..." : "Choose category"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {(categories || []).map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-4 lg:grid-cols-3">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Type</label>
                  <Select
                    value={draft.type}
                    onValueChange={(value) =>
                      setField("type", value as BlockDraft["type"])
                    }
                  >
                    <SelectTrigger className="h-11 rounded-xl bg-background/60">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="COMPONENT">Component</SelectItem>
                      <SelectItem value="SECTION">Section</SelectItem>
                      <SelectItem value="PAGE">Page</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Framework</label>
                  <Select
                    value={draft.framework}
                    onValueChange={(value) =>
                      setField("framework", value as BlockDraft["framework"])
                    }
                  >
                    <SelectTrigger className="h-11 rounded-xl bg-background/60">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="REACT">React</SelectItem>
                      <SelectItem value="VUE">Vue</SelectItem>
                      <SelectItem value="SVELTE">Svelte</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Styling</label>
                  <Select
                    value={draft.stylingEngine}
                    onValueChange={(value) =>
                      setField(
                        "stylingEngine",
                        value as BlockDraft["stylingEngine"]
                      )
                    }
                  >
                    <SelectTrigger className="h-11 rounded-xl bg-background/60">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="TAILWIND">Tailwind</SelectItem>
                      <SelectItem value="CSS">CSS</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Visibility</label>
                <div className="flex flex-wrap gap-3">
                  <VisibilityToggle
                    value={draft.visibility}
                    onChange={(value) => setField("visibility", value)}
                    className="rounded-xl"
                  />
                  <p className="text-xs text-muted-foreground max-w-sm">
                    Choose who can discover your block before it is approved.
                  </p>
                </div>
              </div>
            </div>
          )}

          {step.id === "pricing" && (
            <div className="space-y-5">
              <div className="grid gap-4 lg:grid-cols-3">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Price</label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={draft.price}
                    onChange={(event) => setField("price", event.target.value)}
                    placeholder="49"
                    className="h-11 rounded-xl bg-background/60"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Currency</label>
                  <Select
                    value={draft.currency}
                    onValueChange={(value) =>
                      setField("currency", value as BlockDraft["currency"])
                    }
                  >
                    <SelectTrigger className="h-11 rounded-xl bg-background/60">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="EUR">EUR</SelectItem>
                      <SelectItem value="CLP">CLP</SelectItem>
                      <SelectItem value="GBP">GBP</SelectItem>
                      <SelectItem value="MXN">MXN</SelectItem>
                      <SelectItem value="ARS">ARS</SelectItem>
                      <SelectItem value="BRL">BRL</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">License Tier</label>
                  <Select
                    value={draft.license}
                    onValueChange={(value) =>
                      setField("license", value as BlockDraft["license"])
                    }
                  >
                    <SelectTrigger className="h-11 rounded-xl bg-background/60">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PERSONAL">Personal</SelectItem>
                      <SelectItem value="TEAM">Team</SelectItem>
                      <SelectItem value="ENTERPRISE">Enterprise</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="rounded-2xl border border-dashed border-border/60 bg-muted/20 p-5">
                <p className="text-sm font-semibold">Pricing note</p>
                <p className="text-xs text-muted-foreground mt-2 max-w-xl">
                  License tiers are shown to buyers; final license configuration
                  is applied once the block is approved.
                </p>
              </div>
            </div>
          )}

          {step.id === "upload" && (
            <div className="space-y-5">
              <div className="rounded-[2rem] border border-dashed border-border/60 bg-muted/20 p-8 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <FileCode2 className="size-5" />
                </div>
                <p className="mt-4 text-sm font-semibold">
                  Upload your code bundle
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Zip the component, README, and asset files.
                </p>
                <div className="mt-6 flex flex-col items-center gap-3">
                  <Input
                    type="file"
                    accept=".zip,.tar,.tar.gz"
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      setBundleName(file?.name ?? null);
                    }}
                    className="max-w-sm rounded-xl bg-background/60"
                  />
                  {bundleName && (
                    <Badge variant="secondary" className="rounded-full">
                      {bundleName}
                    </Badge>
                  )}
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Your code never appears in the browser. It is encrypted and only
                unpacked inside the render pipeline.
              </p>
            </div>
          )}

          {step.id === "preview" && (
            <div className="space-y-5">
              <div className="rounded-[2rem] border border-border/40 bg-muted/20 p-6">
                <p className="text-sm font-semibold">Render queue</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Preview assets are generated after upload and saved in your
                  gallery.
                </p>
                <div className="mt-5 flex flex-wrap items-center gap-3">
                  <Button
                    onClick={() => setPreviewQueued(true)}
                    className="rounded-xl"
                    variant={previewQueued ? "secondary" : "default"}
                  >
                    {previewQueued ? "Preview queued" : "Queue preview render"}
                  </Button>
                  {previewQueued && (
                    <Badge variant="secondary" className="rounded-full">
                      Estimated 2-4 minutes
                    </Badge>
                  )}
                </div>
              </div>
              <div className="rounded-2xl border border-dashed border-border/60 bg-background/50 p-6 text-xs text-muted-foreground">
                Uploading a bundle triggers render jobs automatically for each
                viewport. You can re-run them later from the block detail page.
              </div>
            </div>
          )}

          {step.id === "submit" && (
            <div className="space-y-5">
              <div className="rounded-[2rem] border border-border/40 bg-muted/20 p-6">
                <p className="text-sm font-semibold">Review summary</p>
                <div className="mt-4 grid gap-3 text-xs text-muted-foreground">
                  <div className="flex items-center justify-between">
                    <span>Title</span>
                    <span className="font-medium text-foreground">
                      {draft.title || "Untitled"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Slug</span>
                    <span className="font-mono text-foreground">
                      {draft.slug || "-"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Price</span>
                    <span className="font-medium text-foreground">
                      {draft.price
                        ? `${draft.currency} ${draft.price}`
                        : "Not set"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Visibility</span>
                    <span className="font-medium text-foreground">
                      {draft.visibility}
                    </span>
                  </div>
                </div>
              </div>
              <div className="rounded-2xl border border-dashed border-border/60 bg-background/50 p-6 text-xs text-muted-foreground">
                Submitting sends the block to moderation. You can continue to
                edit until it enters review.
              </div>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/40 pt-6">
            <Button
              variant="ghost"
              className="rounded-xl"
              onClick={() => setActiveStep((prev) => Math.max(0, prev - 1))}
              disabled={activeStep === 0}
            >
              Back
            </Button>
            <div className="flex items-center gap-3">
              {step.id !== "submit" ? (
                <Button
                  className="rounded-xl"
                  onClick={() =>
                    setActiveStep((prev) =>
                      Math.min(steps.length - 1, prev + 1)
                    )
                  }
                  disabled={!canContinue}
                >
                  Continue
                </Button>
              ) : (
                <Button
                  className="rounded-xl"
                  onClick={handleSubmit}
                  disabled={isSubmitting || !canContinue}
                >
                  {isSubmitting ? "Submitting..." : "Create block"}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
