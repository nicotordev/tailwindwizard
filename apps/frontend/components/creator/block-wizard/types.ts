import { type Visibility } from "@/components/primitives/visibility-toggle";
import type { components } from "@/types/api";
import { Sparkles, Wand2, FileCode2, CloudUpload, CheckCircle2 } from "lucide-react";
import { FiTriangle } from "react-icons/fi";
import type { IconType } from "react-icons/lib";
import { type IconName } from "tech-stack-icons";

export type WizardStep = "metadata" | "pricing" | "upload" | "preview" | "submit";
export type PreviewAsset = components["schemas"]["PreviewAsset"];

export type BlockDraft = {
  title: string;
  slug: string;
  description: string;
  tags: string[];
  categoryId: string;
  type: "COMPONENT" | "SECTION" | "PAGE";
  price: string;
  currency: "USD" | "EUR" | "CLP" | "GBP" | "MXN" | "ARS" | "BRL";
  license: "PERSONAL" | "TEAM" | "ENTERPRISE";
  framework: "REACT" | "VUE" | "SVELTE";
  stylingEngine: "TAILWIND" | "CSS";
  visibility: Visibility;
};

export const steps: Array<{
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

export const frameworkOptions: Record<
  BlockDraft["framework"],
  { label: string; stack?: IconName; icon?: IconType }
> = {
  REACT: { label: "React", stack: "react" },
  VUE: { label: "Vue", stack: "vuejs" },
  SVELTE: { label: "Svelte", icon: FiTriangle },
};

export const stylingOptions: Record<
  BlockDraft["stylingEngine"],
  { label: string; stack?: IconName; icon?: IconType }
> = {
  TAILWIND: { label: "Tailwind", stack: "tailwindcss" },
  CSS: { label: "CSS", stack: "css3" },
};
