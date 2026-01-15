"use client";

import { Card, CardContent } from "@/components/ui/card";
import { useCategories } from "@/hooks/use-categories";
import { useTags } from "@/hooks/use-tags";
import { frontendApi } from "@/lib/frontend-api";
import type { RenderJob } from "@/types/extended";
import { CreateBlockSchema } from "@tw/shared";
import { useRouter } from "next/navigation";
import * as React from "react";
import { toast } from "sonner";

import { DevManifestEditor } from "./block-wizard/dev-manifest-editor";
import { Sidebar } from "./block-wizard/sidebar";
import { MetadataStep } from "./block-wizard/steps/metadata-step";
import { PreviewStep } from "./block-wizard/steps/preview-step";
import { PricingStep } from "./block-wizard/steps/pricing-step";
import { SubmitStep } from "./block-wizard/steps/submit-step";
import { UploadStep } from "./block-wizard/steps/upload-step";
import { BlockDraft, PreviewAsset, steps } from "./block-wizard/types";
import { WizardHeader } from "./block-wizard/wizard-header";
import { WizardNavigation } from "./block-wizard/wizard-navigation";

const toSlug = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");

export function BlockWizard() {
  const router = useRouter();
  const { data: categories, isLoading: categoriesLoading } = useCategories();
  const { data: tags, isLoading: tagsLoading } = useTags();

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
  const [jobStatus, setJobStatus] = React.useState<RenderJob["status"] | null>(
    null
  );
  const [jobError, setJobError] = React.useState<string | null>(null);
  const [isPreviewing, setIsPreviewing] = React.useState(false);
  const [previews, setPreviews] = React.useState<PreviewAsset[]>([]);

  const [isDevMode, setIsDevMode] = React.useState(false);
  const [jsonInput, setJsonInput] = React.useState("");
  const [jsonError, setJsonError] = React.useState<string | null>(null);

  const isUpdatingFromJson = React.useRef(false);

  const [draft, setDraft] = React.useState<BlockDraft>({
    title: "",
    slug: "",
    description: "",
    tags: [],
    categoryId: "",
    type: "COMPONENT",
    price: "",
    currency: "USD",
    license: "PERSONAL",
    framework: "REACT",
    stylingEngine: "TAILWIND",
    visibility: "PRIVATE",
  });

  // Polling logic for render jobs
  React.useEffect(() => {
    let pollInterval: NodeJS.Timeout;

    if (previewJobId && (jobStatus === "QUEUED" || jobStatus === "RUNNING")) {
      pollInterval = setInterval(async () => {
        try {
          const { data } = await frontendApi.render.status(previewJobId);
          setJobStatus(data.status);
          if (data.status === "SUCCEEDED") {
            toast.success("Preview rendered successfully!");
            clearInterval(pollInterval);

            if (blockId) {
              try {
                const blockRes = await frontendApi.blocks.identifier(blockId);
                if (blockRes.data.previews) {
                  setPreviews(blockRes.data.previews as PreviewAsset[]);
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
      if (typeof parsed === "object" && parsed !== null) {
        const toValidate = {
          ...parsed,
          price:
            typeof parsed.price === "string"
              ? Number(parsed.price)
              : parsed.price,
          tags: Array.isArray(parsed.tags)
            ? parsed.tags
            : typeof parsed.tags === "string"
            ? parsed.tags
                .split(",")
                .map((t: string) => t.trim())
                .filter(Boolean)
            : [],
        };

        const result = CreateBlockSchema.partial().safeParse(toValidate);

        if (!result.success) {
          const errorMsg = result.error.errors
            .map((e) => `${e.path.join(".")}: ${e.message}`)
            .join(", ");
          setJsonError(errorMsg);
          return;
        }

        if (parsed.categoryId && categories) {
          const exists = categories.some((c) => c.id === parsed.categoryId);
          if (!exists) {
            setJsonError(
              `categoryId "${parsed.categoryId}" does not exist in the database.`
            );
            return;
          }
        }

        isUpdatingFromJson.current = true;
        if (typeof parsed.price === "number") {
          parsed.price = String(parsed.price);
        }
        if (typeof parsed.tags === "string") {
          parsed.tags = parsed.tags
            .split(",")
            .map((t: string) => t.trim())
            .filter(Boolean);
        }

        setDraft((prev) => ({ ...prev, ...parsed }));
        setJsonError(null);

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
    tags: draft.tags.length > 0 ? draft.tags : undefined,
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
    jobStatus,
    step.id,
  ]);

  const isStepLocked = (index: number) => {
    if (index <= activeStep) return false;
    if (index <= maxStepReached) return false;
    if (index === activeStep + 1) return !canContinue;
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
      router.push(`/dashboard/forgery/blocks/${response.data.id}`);
    } catch (error) {
      console.error("Failed to submit block:", error);
      toast.error("Unable to submit the block right now.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="grid gap-10 lg:grid-cols-[300px_1fr]">
      <Sidebar
        activeStep={activeStep}
        maxStepReached={maxStepReached}
        isDevMode={isDevMode}
        progressValue={progressValue}
        goToStep={goToStep}
        isStepLocked={isStepLocked}
      />

      <div className="space-y-8">
        <Card className="p-0 bg-card/30 backdrop-blur-2xl border-border/40 rounded-[2.5rem] overflow-hidden shadow-2xl shadow-primary/5">
          <WizardHeader
            activeStep={activeStep}
            isDevMode={isDevMode}
            setIsDevMode={setIsDevMode}
          />
          <CardContent className="p-10">
            {isDevMode && (
              <DevManifestEditor
                jsonInput={jsonInput}
                handleJsonChange={handleJsonChange}
                jsonError={jsonError}
                categories={categories}
                categoriesLoading={categoriesLoading}
                blockId={blockId}
                jobStatus={jobStatus}
                bundleUploaded={bundleUploaded}
              />
            )}

            {step.id === "metadata" && (
              <MetadataStep
                draft={draft}
                setField={setField}
                updateTitle={updateTitle}
                slugTouched={slugTouched}
                setSlugTouched={setSlugTouched}
                categories={categories}
                categoriesLoading={categoriesLoading}
                tags={tags}
                tagsLoading={tagsLoading}
                setDraft={setDraft}
              />
            )}

            {step.id === "pricing" && (
              <PricingStep draft={draft} setField={setField} />
            )}

            {step.id === "upload" && (
              <UploadStep
                isUploadingBundle={isUploadingBundle}
                setIsUploadingBundle={setIsUploadingBundle}
                bundleName={bundleName}
                setBundleName={setBundleName}
                bundleUploaded={bundleUploaded}
                setBundleUploaded={setBundleUploaded}
                setPreviewQueued={setPreviewQueued}
                setPreviewJobId={setPreviewJobId}
                blockId={blockId}
                ensureDraft={ensureDraft}
              />
            )}

            {step.id === "preview" && (
              <PreviewStep
                blockId={blockId}
                ensureDraft={ensureDraft}
                isPreviewing={isPreviewing}
                setIsPreviewing={setIsPreviewing}
                setJobError={setJobError}
                setPreviewQueued={setPreviewQueued}
                setPreviewJobId={setPreviewJobId}
                setJobStatus={setJobStatus}
                previewQueued={previewQueued}
                jobStatus={jobStatus}
                bundleUploaded={bundleUploaded}
                previews={previews}
                jobError={jobError}
              />
            )}

            {step.id === "submit" && <SubmitStep draft={draft} />}

            <WizardNavigation
              activeStep={activeStep}
              setActiveStep={setActiveStep}
              canContinue={canContinue}
              isDraftCreating={isDraftCreating}
              isSubmitting={isSubmitting}
              goToStep={goToStep}
              handleSubmit={handleSubmit}
            />
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
