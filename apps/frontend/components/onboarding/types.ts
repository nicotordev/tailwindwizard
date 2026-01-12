import { Layout, Layers, Globe, Shield, Sparkles } from "lucide-react";
import * as z from "zod";

export const onboardingSchema = z.object({
  role: z.enum(["CREATOR", "BUILDER"]),
  displayName: z.string().min(2, "Name must be at least 2 characters"),
  bio: z.string().max(500, "Bio must be less than 500 characters").optional(),
  country: z.string().min(1, "Please select a country"),
  websiteUrl: z
    .string()
    .optional()
    .transform((val) => (val === "" ? undefined : val)),
  githubUsername: z.string().optional(),
  twitterUsername: z.string().optional(),
  interests: z.array(z.string()).min(1, "Select at least one interest"),
  imageUrl: z.string().optional(),
});

export type OnboardingFormData = z.infer<typeof onboardingSchema>;

export type OnboardingStep = "role" | "profile" | "interests" | "payment";

export const STEP_ORDER: readonly OnboardingStep[] = [
  "role",
  "profile",
  "interests",
  "payment",
] as const;

export const PRESET_CATEGORIES: ReadonlyArray<{
  id: string;
  name: string;
  icon: typeof Layout;
}> = [
  { id: "marketing", name: "Marketing", icon: Layout },
  { id: "ecommerce", name: "E-commerce", icon: Layers },
  { id: "dashboard", name: "Dashboards", icon: Layout },
  { id: "landing", name: "Landing Pages", icon: Globe },
  { id: "forms", name: "Forms & Auth", icon: Shield },
  { id: "shadcn", name: "Shadcn UI", icon: Sparkles },
  { id: "animated", name: "Animated", icon: Sparkles },
];
